// ============================================================
// I Ching — Settings Module
// Manages user API configuration (provider-agnostic)
// ============================================================
(function() {
  'use strict';
  var ns = window.IChing || {};
  window.IChing = ns;

  var STORAGE_KEY = 'iching-settings';

  var defaults = {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    apiModel: 'gpt-4o-mini'
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, defaults);
      var saved = JSON.parse(raw);
      // Migrate old settings that had 'provider' field
      if (saved.provider) delete saved.provider;
      return Object.assign({}, defaults, saved);
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }

  function save(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) { /* storage full */ }
  }

  function get(key) {
    return load()[key];
  }

  function set(key, value) {
    var s = load();
    s[key] = value;
    save(s);
  }

  function isApiReady() {
    var key = get('apiKey');
    var url = get('baseUrl');
    return key && key.trim().length > 0 && url && url.trim().length > 0;
  }

  ns.Settings = {
    load: load, save: save, get: get, set: set,
    isApiReady: isApiReady
  };
  console.log('[iching] settings module loaded');
})();
