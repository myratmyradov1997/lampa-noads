'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'noads.js'), 'utf8');
let handler, registrations = 0, playlist = [];
class XHR { constructor(url, body) { this.responseURL = url; this.body = body; } }
Object.defineProperty(XHR.prototype, 'responseText', { configurable: true, get() { return this.body; } });
const Lampa = {
  Player: { listener: { follow(event, cb) { assert.equal(event, 'create'); handler = cb; registrations++; } } },
  PlayerPlaylist: { get: () => playlist, set: value => { playlist = value; } }
};
const window = { Lampa, XMLHttpRequest: XHR };
const context = vm.createContext({ window, Lampa, XMLHttpRequest: XHR, console: { log() {} } });
vm.runInContext(source, context);
vm.runInContext(source, context);
assert.equal(registrations, 1);
const item = { url: 'video', vast_url: 'ad', vast_banner: 'banner' };
handler({ data: item });
assert.equal(item.continue_play, true);
assert.equal('vast_url' in item, false);
assert.equal('vast_banner' in item, false);
assert.equal(playlist[0], item);
const replacement = { url: 'video' };
handler({ data: replacement });
assert.equal(playlist[0], replacement);
assert.equal(new XHR('https://example.test/api/ad/get/preroll?x=1', 'ads').responseText, '{"ad":[]}');
assert.equal(new XHR('https://example.test/api/ad/get/banner', 'ads').responseText, '{"ad":[]}');
assert.equal(new XHR('https://example.test/api/search', 'search results').responseText, 'search results');
console.log('All Lampa NoAds tests passed.');
