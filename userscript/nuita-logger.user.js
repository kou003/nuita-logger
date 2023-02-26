// ==UserScript==
// @name         nuita-logger
// @namespace    https://github.com/kou003/
// @version      0.1.2
// @description  nuita-logger
// @author       kou003
// @match        *://nhentai.net/g/*
// @match        *://*.nijie.info/view.php?*
// @updateURL    https://github.com/kou003/nuita-logger/raw/master/userscript/nuita-logger.user.js
// @downloadURL  https://github.com/kou003/nuita-logger/raw/master/userscript/nuita-logger.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

{
  'use strict';
  const post = (url, image, title, author, options) => {
    if (!localStorage['nuita-logger-id']) {
      localStorage['nuita-logger-id'] = prompt('nuita-logger-id');
    }
    fetch(`https://script.google.com/macros/s/${localStorage['nuita-logger-id']}/exec`, {
      method: "POST",
      mode: 'no-cors',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, image, title, author, ...options })
    });
  }


  const nhentai = () => {
    const content = document.querySelector('#info>.buttons') ?? document.querySelector('nav');
    if (!content) return;
    const btn = content.appendChild(document.createElement('button'));
    btn.textContent = 'Nuita';
    btn.className = 'btn btn-secondary';
    btn.addEventListener('click', e => {
      if (confirm('抜いた?')) {
        const g = window._gallery;
        const gid = g.id;
        const mid = g.media_id;
        const ext = ({ j: "jpg", p: "png", g: "gif" })[g.images.cover.t];
        const url = `https://nhentai.net/g/${gid}/`;
        const image = `https://t5.nhentai.net/galleries/${mid}/cover.${ext}`;
        const title = g.title.japanese || g.title.english || document.title;
        const author = document.querySelector('#tags a:where([href^="/artist/"], [href^="/group/"]) .name')?.textContent || '';
        const { images, ...info } = g;
        post(url, image, title, author, { extends: { info } });
      }
    })
  }

  const nijie = () => {
    const _ajax = $.ajax;
    $.ajax = (a, b) => {
      const settings = (typeof a == 'object') ? a : b;
      const url = new URL(a.url ?? a, location.href);
      if (url.pathname === "/php/ajax/add_nuita.php") {
        const { id } = settings.data;
        const url_ = `https://nijie.info/view.php?id=${id}`;
        const title = document.querySelector('.illust_title').textContent || document.title;
        const img = document.querySelector('#gallery img');
        const image = img.src ? new URL(img.src, location.href).toString() : '';
        const authorLink = document.querySelector('#pro a.name');
        const author = authorLink.textContent;
        const description = document.querySelector('#illust_text').textContent;
        const options = {
          extends: {
            raw_url: location.hrer,
            author_link: authorLink.href,
            description
          }
        }
        post(url_, image, title, author, options);
      }
      _ajax(a, b);
    }
  }

  const nijieSp = () => {
    const _ajax = $.ajax;
    $.ajax = (a, b) => {
      const settings = (typeof a == 'object') ? a : b;
      const url = new URL(a.url ?? a, location.href);
      if (url.pathname === "/php/ajax/set_illust_nuita.php") {
        const { id } = settings.data;
        const url_ = `https://nijie.info/view.php?id=${id}`;
        const title = document.querySelector('.view-title h1').textContent || document.title;
        const img = document.querySelector('#illust img');
        const image = img.src ? new URL(img.src, location.href).toString() : '';
        const authorLink = document.querySelector('#main-container a[href^="/members.php"]');
        const author = authorLink.textContent;
        const description = document.querySelector('#illust_text').textContent;
        const options = {
          extends: {
            raw_url: location.hrer,
            author_link: authorLink.href,
            description
          }
        }
        post(url_, image, title, author, options);
      }
      _ajax(a, b);
    }
  }


  const main = () => {
    switch (location.hostname) {
      case 'nhentai.net':
        nhentai();
        break;
      case 'nijie.info':
        nijie();
        break;
      case 'sp.nijie.info':
        nijieSp();
        break;
    }
  }


  if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
}