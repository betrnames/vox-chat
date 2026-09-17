/** Load Google Analytics only after cookie consent. */
(function () {
  var GA_ID = 'G-N28W6ZESL4'
  var KEY = 'vox-cookie-consent'
  var loaded = false

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
    }
    document.head.appendChild(s)
  }

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
