(function () {
  function drawHeatmap() {
    var data = window.__heatmapData;
    if (!data) return; // Wait until data is loaded
    
    var canvas = document.getElementById('blog-heatmap');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    // Clear canvas for redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var CELL = 11;
    var GAP = 2;
    var COLS = 18; // 约18周
    var ROWS = 7;  // 周一到周日
    var OFFSET_X = 2;
    var OFFSET_Y = 14;

    // Read theme colors from CSS variables
    var rootStyles = getComputedStyle(document.documentElement);
    var COLORS = [
      rootStyles.getPropertyValue('--heatmap-l0').trim() || '#ebedf0',
      rootStyles.getPropertyValue('--heatmap-l1').trim() || '#9be9a8',
      rootStyles.getPropertyValue('--heatmap-l2').trim() || '#40c463',
      rootStyles.getPropertyValue('--heatmap-l3').trim() || '#30a14e',
      rootStyles.getPropertyValue('--heatmap-l4').trim() || '#216e39'
    ];

    function getLevel(count) {
      if (!count) return 0;
      if (count === 1) return 1;
      if (count === 2) return 2;
      if (count <= 4) return 3;
      return 4;
    }

    // Generate date sequence
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var startDay = new Date(today);
    startDay.setDate(today.getDate() - (COLS * ROWS - 1));

    var fontSize = 9;
    ctx.font = fontSize + 'px sans-serif';

    var prevMonth = -1;
    for (var col = 0; col < COLS; col++) {
      for (var row = 0; row < ROWS; row++) {
        var idx = col * ROWS + row;
        var d = new Date(startDay);
        d.setDate(startDay.getDate() + idx);

        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');

        var count = data[key] || 0;
        var level = getLevel(count);

        var x = OFFSET_X + col * (CELL + GAP);
        var y = OFFSET_Y + row * (CELL + GAP);

        // Draw Month labels (Jan, Feb...) at row 0 when month shifts
        if (row === 0 && month !== prevMonth) {
          var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          ctx.fillStyle = rootStyles.getPropertyValue('--text-muted').trim() || '#767676';
          ctx.fillText(monthNames[month], x, OFFSET_Y - 3);
          prevMonth = month;
        }

        // Draw Cell Rect
        ctx.fillStyle = COLORS[level];
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, CELL, CELL, 2);
        } else {
          ctx.rect(x, y, CELL, CELL);
        }
        ctx.fill();
      }
    }
  }

  function initHeatmap() {
    if (window.__heatmapData) {
      drawHeatmap();
      return;
    }

    // Fetch heatmap data asynchronously from generated json
    fetch('/heatmap.json')
      .then(function(res) { return res.json(); })
      .then(function(json) {
        window.__heatmapData = json;
        drawHeatmap();
      })
      .catch(function(err) {
        console.error('Failed to load heatmap data:', err);
      });
  }

  // Initial Draw
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeatmap);
  } else {
    initHeatmap();
  }

  // MutationObserver to watch theme toggle on HTML tag
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        setTimeout(drawHeatmap, 60); // Tiny timeout to let CSS repaint variables
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Setup tooltip
  var canvas = document.getElementById('blog-heatmap');
  if (!canvas) return;
  var CELL = 11;
  var GAP = 2;
  var OFFSET_X = 2;
  var OFFSET_Y = 14;
  var COLS = 18;
  var ROWS = 7;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var startDay = new Date(today);
  startDay.setDate(today.getDate() - (COLS * ROWS - 1));

  var tooltip = document.getElementById('heatmap-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'heatmap-tooltip';
    tooltip.style.cssText = 'position:fixed;background:rgba(15, 23, 42, 0.9);backdrop-filter:blur(6px);color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;pointer-events:none;display:none;z-index:9999;white-space:nowrap;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);font-family:inherit;';
    document.body.appendChild(tooltip);
  }

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var col = Math.floor((mx - OFFSET_X) / (CELL + GAP));
    var row = Math.floor((my - OFFSET_Y) / (CELL + GAP));

    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      var idx = col * ROWS + row;
      var d = new Date(startDay);
      d.setDate(startDay.getDate() + idx);
      var year = d.getFullYear();
      var month = d.getMonth();
      var day = d.getDate();
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var data = window.__heatmapData || {};
      var count = data[key] || 0;
      var dateStr = year + '/' + (month + 1) + '/' + day;
      tooltip.textContent = dateStr + ' : ' + count + ' 篇文章';
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 32) + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  });

  canvas.addEventListener('mouseleave', function () {
    tooltip.style.display = 'none';
  });
})();
