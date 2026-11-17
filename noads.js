// Personal Lampa: disable app-managed video ads for all playback sources.
(function () {
  'use strict';
  function install() {
    if (window.myrat_lampa_noads || !window.Lampa || !Lampa.Player || !Lampa.Player.listener) return;
    window.myrat_lampa_noads = '1.1.0';
    Lampa.Player.listener.follow('create', function (event) {
      var data = event && event.data;
      if (!data) return;
      delete data.vast_url;
      delete data.vast_banner;
      var list = Lampa.PlayerPlaylist.get() || [];
      if (list.indexOf(data) < 0) {
        var index = list.findIndex(function (item) { return item.url === data.url; });
        list = index >= 0 ? list.slice() : [data];
        if (index >= 0) list[index] = data;
        Lampa.PlayerPlaylist.set(list);
      }
      // App's native skip-preroll path, also excludes in-player ad banners.
      data.continue_play = true;
    });
    // Empty only Lampa's ad catalogs; normal search/metadata requests stay intact.
    var prototype = window.XMLHttpRequest && XMLHttpRequest.prototype;
    var descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, 'responseText');
    if (descriptor && descriptor.get && descriptor.configurable) {
      Object.defineProperty(prototype, 'responseText', {
        configurable: true, enumerable: descriptor.enumerable,
        get: function () {
          if (/\/api\/ad\/get\/(?:preroll|banner)(?:[?#]|$)/.test(this.responseURL || '')) return '{"ad":[]}';
          return descriptor.get.call(this);
        }
      });
    }
    console.log('[MyRatNoAds] enabled for all Lampa playback sources');
  }
  if (window.Lampa) install();
  else if (window.addEventListener) window.addEventListener('load', install, { once: true });
})();
