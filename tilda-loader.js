(function () {
  'use strict';

  if (window.__RD_GITHUB_CARD_LOADER__) return;
  window.__RD_GITHUB_CARD_LOADER__ = true;

  var SOURCE = 'https://raw.githubusercontent.com/markgenesisai-lab/red-dragon-card/main/index.html';
  var HOST_ID = 'rd-red-dragon-github-host';

  function load() {
    if (document.getElementById(HOST_ID)) return;

    var host = document.createElement('div');
    host.id = HOST_ID;
    host.style.width = '100%';
    host.style.margin = '0';
    host.style.padding = '0';
    host.style.minHeight = '1px';

    var anchor = document.currentScript && document.currentScript.parentNode;
    if (anchor) {
      anchor.insertBefore(host, document.currentScript);
    } else {
      (document.querySelector('.t-container, .t-records, body') || document.body).appendChild(host);
    }

    fetch(SOURCE + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('GitHub source HTTP ' + response.status);
        return response.text();
      })
      .then(function (html) {
        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var nodes = Array.prototype.slice.call(parsed.body.childNodes);

        nodes.forEach(function (node) {
          if (node.nodeType === 1 && node.tagName === 'SCRIPT') return;
          host.appendChild(document.importNode(node, true));
        });

        Array.prototype.slice.call(parsed.querySelectorAll('style')).forEach(function (styleNode) {
          var style = document.createElement('style');
          style.textContent = styleNode.textContent || '';
          Array.prototype.slice.call(styleNode.attributes).forEach(function (attr) {
            style.setAttribute(attr.name, attr.value);
          });
          document.head.appendChild(style);
        });

        var scripts = Array.prototype.slice.call(parsed.querySelectorAll('script'));
        var chain = Promise.resolve();

        scripts.forEach(function (oldScript) {
          chain = chain.then(function () {
            return new Promise(function (resolve, reject) {
              var script = document.createElement('script');
              Array.prototype.slice.call(oldScript.attributes).forEach(function (attr) {
                script.setAttribute(attr.name, attr.value);
              });
              script.textContent = oldScript.textContent || '';
              script.onload = resolve;
              script.onerror = function () {
                reject(new Error('Failed to execute GitHub card script'));
              };
              document.body.appendChild(script);
              if (!oldScript.src) resolve();
            });
          });
        });
      })
      .catch(function (error) {
        console.error('[Red Dragon] GitHub loader error:', error);
        host.innerHTML = '<div style="padding:20px;font:14px/1.5 Arial,sans-serif;color:#b42318;background:#fff1f1;border:1px solid #f0b4b4;border-radius:10px;">Не удалось загрузить карточку.</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }
})();
