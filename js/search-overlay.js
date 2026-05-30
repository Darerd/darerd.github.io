/**
 * Search Overlay Handler
 * Optimized for performance, autofocus, and input behavior.
 */
(function() {
  var overlay = document.getElementById('search-overlay');
  var input = document.getElementById('search-overlay-input');
  var result = document.getElementById('search-overlay-result');
  var toggle = document.getElementById('search-toggle');
  var closeBtn = document.querySelector('.search-overlay-close');

  if (!overlay || !input || !toggle) return;

  function openSearch() {
    overlay.classList.add('active');
    // Auto-focus after the modal transition finishes (50ms) to ensure smooth layout transitions
    setTimeout(function() {
      input.focus();
    }, 50);
    input.addEventListener('input', handleOverlaySearch);
  }

  function closeSearch() {
    overlay.classList.remove('active');
    input.value = '';
    if (result) result.innerHTML = '';
  }

  function handleOverlaySearch() {
    if (!result) return;
    var rawVal = this.value.trim();
    
    // Fix UX Bug: Instantly clear results when input is empty. Prevents flashing "Searching..." text.
    if (rawVal.length <= 0) {
      result.innerHTML = '';
      return;
    }

    var keywords = rawVal.toLowerCase().split(/[\s\-]+/);
    result.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">搜索中...</p>';

    function doSearch(datas) {
      var str = '<ul class="search-result-list">';
      var matchCount = 0;
      
      datas.forEach(function(data) {
        var isMatch = true;
        var data_title = (data.title || '').trim().toLowerCase();
        var data_content = (data.content || '').replace(/<[^>]+>/g, '').toLowerCase();
        var data_url = data.url || '';
        
        keywords.forEach(function(keyword) {
          if (data_title.indexOf(keyword) < 0 && data_content.indexOf(keyword) < 0) {
            isMatch = false;
          }
        });
        
        if (isMatch && matchCount < 8) {
          matchCount++;
          var idx = data_content.indexOf(keywords[0]);
          var content = '';
          if (idx > -1) {
            var start = Math.max(0, idx - 40);
            var end = Math.min(data_content.length, idx + 80);
            content = (start > 0 ? '...' : '') + data_content.substring(start, end) + (end < data_content.length ? '...' : '');
          }
          str += '<li><a class="search-result-title" href="' + data_url + '">' + data.title + '</a>';
          if (content) str += '<p class="search-result">' + content + '</p>';
          str += '</li>';
        }
      });
      str += '</ul>';
      result.innerHTML = matchCount === 0 ? '<p style="text-align:center;color:var(--text-secondary);padding:20px;">未找到相关文章</p>' : str;
    }

    if (window._searchData) {
      doSearch(window._searchData);
    } else {
      // Path is globally defined in after_footer.pug
      var searchPath = window.search_overlay_path || path || '/search.xml';
      $.ajax({
        url: searchPath,
        dataType: 'xml',
        success: function(xmlResponse) {
          var datas = $('entry', xmlResponse).map(function() {
            return {
              title: $('title', this).text(),
              content: $('content', this).text(),
              url: $('url', this).text()
            };
          }).get();
          window._searchData = datas;
          doSearch(datas);
        }
      });
    }
  }

  if (toggle) toggle.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
  });
})();
