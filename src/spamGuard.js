/**
 * Lead-form spam heuristics shared by the browser (src/leadForm.ts) and the
 * server (api/lead.js). Plain ESM JS so both sides import the same rules.
 */

/** In-service US geographic + toll-free area codes (NANPA npa_report, Oct 2026). */
const US_AREA_CODES = new Set('201 202 203 205 206 207 208 209 210 212 213 214 215 216 217 218 219 220 223 224 225 227 228 229 231 234 235 239 240 248 251 252 253 254 256 260 262 267 269 270 272 274 276 279 281 283 301 302 303 304 305 307 308 309 310 312 313 314 315 316 317 318 319 320 321 323 324 325 326 327 329 330 331 332 334 336 337 339 340 341 346 347 350 351 352 353 357 360 361 363 364 369 380 385 386 401 402 404 405 406 407 408 409 410 412 413 414 415 417 419 423 424 425 430 432 434 435 436 440 442 443 445 447 448 457 458 463 464 465 469 470 471 472 475 478 479 480 483 484 501 502 503 504 505 507 508 509 510 512 513 515 516 517 518 520 530 531 534 539 540 541 551 557 559 561 562 563 564 567 570 571 572 573 574 575 580 582 585 586 601 602 603 605 606 607 608 609 610 612 614 615 616 617 618 619 620 621 623 624 626 628 629 630 631 636 640 641 645 646 650 651 656 657 659 660 661 662 667 669 670 671 678 679 680 681 682 684 686 689 701 702 703 704 706 707 708 712 713 714 715 716 717 718 719 720 724 725 726 727 728 729 730 731 732 734 737 738 740 743 747 748 754 757 760 762 763 765 769 770 771 772 773 774 775 779 781 785 786 787 800 801 802 803 804 805 806 808 810 812 813 814 815 816 817 818 820 821 826 828 830 831 832 833 835 837 838 839 840 843 844 845 847 848 850 854 855 856 857 858 859 860 861 862 863 864 865 866 870 872 877 878 888 901 903 904 906 907 908 909 910 912 913 914 915 916 917 918 919 920 924 925 928 929 930 931 934 936 937 938 939 940 941 943 945 947 948 949 951 952 954 956 959 970 971 972 973 975 978 979 980 983 984 985 986 989'.split(' '))

export const HONEYPOT_FIELD = '_gotcha' // Formspree's built-in honeypot name
export const STARTED_FIELD = '_t' // ms timestamp when the form was rendered
export const MIN_FILL_MS = 3000

// Two-consonant word starts that occur in real names (English, Spanish, Slavic, etc.).
const OK_ONSETS = new Set(
  'bl br ch cl cr dr fl fr gl gr kl kr pl pr sc sh sk sl sm sn sp st sw th tr tw wh wr ph ps ng mc kn gn dw gw zh ts sv vl sz cz dj kh ll rh bj fj sr zw vr pf dv kw'.split(' '),
)

/** True when a single word looks like keyboard-mash / random letters. */
function wordIsGibberish(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length < 4) return false
  const vowels = (w.match(/[aeiouy]/g) || []).length
  if (vowels === 0) return true
  if (vowels / w.length < 0.12) return true
  if (/[^aeiouy]{6,}/.test(w)) return true
  // Starts with a consonant pair no real name starts with (e.g. "Fb…", "Xq…").
  if (/^[^aeiouy]{2}/.test(w) && !OK_ONSETS.has(w.slice(0, 2))) return true
  return false
}

/** True when any real word in a name / business string looks random. */
export function looksGibberish(text) {
  if (typeof text !== 'string' || !text.trim()) return false
  return text
    .split(/[\s\-&.,'/]+/)
    .filter((w) => !/^(llc|inc|co|corp|ltd|hvac|dba)$/i.test(w))
    .some(wordIsGibberish)
}

/** Returns the 3-digit area code, or '' when the number is not a 10-digit US number. */
export function areaCode(phone) {
  let d = String(phone || '').replace(/\D/g, '')
  if (d.length === 11 && d[0] === '1') d = d.slice(1)
  return d.length === 10 ? d.slice(0, 3) : ''
}

export function validUsPhone(phone) {
  const ac = areaCode(phone)
  return !!ac && US_AREA_CODES.has(ac)
}

/** Gmail ignores dots; bots stuff them in to reuse one inbox. */
export function gmailDotCount(email) {
  const m = /^([^@]+)@(gmail|googlemail)\.com$/i.exec(String(email || '').trim())
  return m ? (m[1].split('+')[0].match(/\./g) || []).length : 0
}

export function normalizeEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  const m = /^([^@]+)@(gmail|googlemail)\.com$/.exec(e)
  if (!m) return e
  return m[1].split('+')[0].replace(/\./g, '') + '@gmail.com'
}

/**
 * Score a submission. opts.cityExpected = the form has a city field.
 * Returns { spam, reasons, flags, normalizedEmail }.
 * Hard blocks: honeypot filled, submitted too fast, gibberish name/business,
 * bad US area code, or missing city on forms that ask for it.
 * Dot-stuffed gmail: 2-3 dots = delivered but flagged; 4+ dots = blocked.
 */
export function checkLead(fields, opts) {
  const f = fields || {}
  const o = opts || {}
  const reasons = []
  const flags = []
  if (f[HONEYPOT_FIELD]) reasons.push('honeypot')
  const started = Number(f[STARTED_FIELD])
  if (!started || Date.now() - started < MIN_FILL_MS) reasons.push('too-fast')
  if (looksGibberish(f.name)) reasons.push('gibberish-name')
  if (looksGibberish(f.business)) reasons.push('gibberish-business')
  if (f.phone && !validUsPhone(f.phone)) reasons.push('bad-area-code')
  if (o.cityExpected && !String(f.city || '').trim()) reasons.push('missing-city')
  const dots = gmailDotCount(f.email)
  if (dots >= 2) flags.push('dot-stuffed-gmail')
  if (dots >= 4) reasons.push('dot-stuffed-gmail')
  return { spam: reasons.length > 0, reasons, flags, normalizedEmail: normalizeEmail(f.email) }
}
