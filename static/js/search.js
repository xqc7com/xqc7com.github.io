document.addEventListener('DOMContentLoaded', () => {
  console.log('search.js loaded'); // 调试日志：确认脚本加载

  const searchButton = document.querySelector('.search-button');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchPopup = document.querySelector('.search-popup');
  const searchInput = document.querySelector('#search-input');
  const searchEngines = document.querySelectorAll('.search-engine');
  const siteDomain = window.location.hostname || 'example.com'; // 提供默认域名以防万一

  const engines = {
    google: { name: 'Google', url: 'https://www.google.com/search?q=', siteQuery: `site:${siteDomain} ` },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', siteQuery: `site:${siteDomain} ` },
    yahoo: { name: '雅虎', url: 'https://search.yahoo.com/search?p=', siteQuery: `site:${siteDomain} ` },
    baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=', siteQuery: `site:${siteDomain} ` }
  };

  let currentEngine = 'google';

  function openSearch() {
    console.log('openSearch called'); // 调试日志：确认函数调用
    if (searchOverlay && searchPopup) {
      searchOverlay.style.display = 'flex';
      searchOverlay.classList.add('show');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    } else {
      console.error('searchOverlay or searchPopup not found');
    }
  }

  window.closeSearch = function() {
    console.log('closeSearch called'); // 调试日志
    if (searchOverlay) {
      searchOverlay.classList.remove('show');
      setTimeout(() => {
        searchOverlay.style.display = 'none';
      }, 300);
      if (searchInput) searchInput.value = '';
    }
  };

  window.performSearch = function() {
    console.log('performSearch called'); // 调试日志
    if (!searchInput) {
      console.error('searchInput not found');
      return;
    }
    const keyword = searchInput.value.trim();
    if (!keyword) {
      alert('请输入搜索关键词！');
      return;
    }
    const engine = engines[currentEngine];
    const query = engine.siteQuery + keyword;
    const url = engine.url + encodeURIComponent(query);
    window.open(url, '_blank');
    closeSearch();
  };

  if (searchButton) {
    searchButton.addEventListener('click', (e) => {
      console.log('Search button clicked'); // 调试日志
      e.preventDefault();
      e.stopPropagation();
      if (searchOverlay.style.display === 'flex') {
        closeSearch();
      } else {
        openSearch();
      }
    });
  } else {
    console.error('searchButton not found');
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  if (searchPopup) {
    searchPopup.addEventListener('click', (e) => e.stopPropagation());
  }

  if (searchEngines) {
    searchEngines.forEach(engine => {
      engine.addEventListener('click', () => {
        console.log(`Engine selected: ${engine.dataset.engine}`); // 调试日志
        searchEngines.forEach(e => e.classList.remove('active'));
        engine.classList.add('active');
        currentEngine = engine.dataset.engine;
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (searchOverlay && searchOverlay.style.display === 'flex') {
      if (e.key === 'Escape') {
        closeSearch();
      } else if (e.key === 'Enter') {
        performSearch();
      }
    }
  });
});