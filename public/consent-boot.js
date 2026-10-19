/** Load Google Analytics only after cookie consent. */
(function () {
  try {
    if (localStorage.getItem('vox-theme') !== 'light') {
      document.documentElement.classList.add('dark')
    }
  } catch (e) {}

  var GA_ID = 'G-N28W6ZESL4'
  var KEY = 'vox-cookie-consent'
  var loaded = false
  var ready = false
  var pending = []

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }

  function readStored() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || 'null')
      return parsed && parsed.analytics === true
    } catch (e) {
      return false
    }
  }

  function loadGtag() {
    if (loaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
      return
    }
    loaded = true
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    var s = document.createElement('script')
    s.async = true
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID
    s.onload = function () {
      window.gtag('js', new Date())
      window.gtag('config', GA_ID, { anonymize_ip: true })
      ready = true
      flush()
    }
    document.head.appendChild(s)
  }

  function flush() {
    var q = pending
    pending = []
    for (var i = 0; i < q.length; i++) window.gtag('event', q[i][0], q[i][1])
  }

  /**
   * Conversion events. Fired only after consent + gtag config; before that they are held in
   * memory (never sent) and flushed once the visitor accepts analytics on this page.
   */
  window.__voxTrack = function (name, params) {
    if (ready) window.gtag('event', name, params || {})
    else if (pending.length < 50) pending.push([name, params || {}])
  }

  // Delegated click tracking so every page (incl. static blog pages) reports call/demo/booking clicks.
  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null
      if (!a) return
      var href = a.getAttribute('href') || ''
      var label = (a.textContent || '').trim().slice(0, 80)
      if (href.indexOf('tel:') === 0) window.__voxTrack('call_click', { link_url: href, link_text: label })
      else if (/#demos?(-|$)/.test(href)) window.__voxTrack('demo_click', { link_url: href, link_text: label })
      else if (/#contact$/.test(href)) window.__voxTrack('booking_click', { link_url: href, link_text: label })
    },
    true,
  )

  window.__voxApplyConsent = function (analytics) {
    if (analytics) {
      loadGtag()
      return
    }
    if (loaded) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
    }
  }

  if (readStored()) loadGtag()
})()
