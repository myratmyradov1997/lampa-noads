# Lampa NoAds

A small, standalone Lampa plugin based on the `MyRatNoAds 1.1.0` module used in the author's KinoKrad and Dorama plugins. It targets **ads managed by Lampa's player**: prerolls and in-player banners. It does not remove ads embedded in the video itself or ads controlled independently by a source, iframe, or another app.

[Русская инструкция](README.ru.md) · [How it works](#how-it-works) · [Troubleshooting](#troubleshooting)

## Install

1. Open Lampa and go to **Settings → Plugins** (wording may differ between builds). Find the option to add a plugin by URL.
2. Add this JavaScript URL:

   ```text
   https://myratmyradov1997.github.io/lampa-noads/noads.js
   ```

3. Enable the plugin if your build requires it, then **fully restart Lampa**. If Lampa runs inside MSX or another shell, close and reopen the hosting app.
4. Play a video from your usual source. The plugin needs to be loaded on each device where you want it to work. Restart after changing its URL or removing an older plugin.

You do not need a Mac mini: it was simply the host for the author's original plugins. You can also host `noads.js` on your own HTTP(S) server and add that URL instead. The URL must return the JavaScript file itself, not a GitHub HTML page. Your Lampa device must be able to reach the host; some builds may restrict insecure HTTP or cross-origin requests.

## How it works

The plugin runs in Lampa's JavaScript environment; it is not a network-wide ad blocker. When the player emits `create`, it removes `vast_url` and `vast_banner` from the player data, ensures that same object is in `PlayerPlaylist`, and sets `continue_play = true`. The Lampa build used by the author treats that as a playlist continuation and skips the app-managed preroll and in-player banner.

It also wraps the `XMLHttpRequest.responseText` getter, **when that getter is configurable**, so responses whose URLs match `/api/ad/get/preroll` or `/api/ad/get/banner` appear to Lampa as `{"ad":[]}`. Other response text is passed through. This changes what the application reads; it does not guarantee the ad request itself is blocked.

The guard `window.myrat_lampa_noads` prevents installing the same hook twice. If your KinoKrad or Dorama plugin already includes MyRatNoAds, whichever copy loads first takes effect. This standalone version deliberately does not change video quality or DNS.

## Limitations and troubleshooting

- Lampa and its forks change: internal player APIs, playlist behavior, and ad endpoints are not a stable public contract. This was adapted from a setup tested in November 2026; it is not guaranteed to work on every build or device.
- It cannot remove ads burned into the video, advertisements inserted by an external provider, or traffic handled outside these hooks (for example, `fetch` instead of XHR).
- If prerolls remain, verify the URL opens as JavaScript on the device, the plugin is enabled, and the hosting app has been fully restarted. Check the JavaScript console for `[MyRatNoAds] enabled for all Lampa playback sources` if your device exposes one.
- An existing embedded copy may take precedence. Temporarily disable duplicate plugins when diagnosing conflicts. Remove the plugin and restart to undo its changes; no system DNS settings are changed.
- If `Lampa.Player` is unavailable when the plugin initializes, the hook cannot install. Different builds may load plugins at different times.

## Self-host and develop

Serve this directory using any static web server, for example:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Use `http://<computer-LAN-address>:8000/noads.js` on a device on the same network, subject to your Lampa build's security rules. This simple server has no authentication or TLS; use a suitable HTTPS server for internet access. To check the implementation locally (Node.js required):

```sh
node --check noads.js
node tests/noads.test.js
```

The tests simulate Lampa's interfaces; they do not replace playback testing on a real TV or Lampa build.

## License

[MIT](LICENSE). This independent project is not affiliated with Lampa or the sources accessed through it.
