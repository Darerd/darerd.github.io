(function () {
  var data = window.__heatmapData || {};
  var canvas = document.getElementById('blog-heatmap');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var CELL = 11;
  var GAP = 2;
  var COLS = 18; // 约18周
  var ROWS = 7;  // 周一到周日
  var OFFSET_X = 2;
  var OFFSET_Y = 14;

  // 颜色等级（仿 GitHub 绿色系）
  var COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

  function getLevel(count) {
    if (!count) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  }

  // 生成过去 COLS*7 天的日期序列
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // 从今天往前推，对齐到周日开始
  var startDay = new Date(today);
  startDay.setDate(today.getDate() - (COLS * ROWS - 1));

  // 月份标签
  var monthLabels = [];
  var prevMonth = -1;

  // 绘制月份标签和格子
  var fontSize = 9;
  ctx.font = fontSize + 'px sans-serif';
  ctx.fillStyle = '#767676';

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

      // 月份标签（每列第一行，月份变化时显示）
      if (row === 0 && month !== prevMonth) {
        var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        ctx.fillStyle = '#767676';
        ctx.fillText(monthNames[month], x, OFFSET_Y - 3);
        prevMonth = month;
      }

      // 绘制格子
      ctx.fillStyle = COLORS[level];
      ctx.beginPath();
      ctx.roundRect(x, y, CELL, CELL, 2);
      ctx.fill();
    }
  }

  // tooltip
  var tooltip = document.createElement('div');
  tooltip.id = 'heatmap-tooltip';
  tooltip.style.cssText = 'position:fixed;background:#333;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;pointer-events:none;display:none;z-index:9999;white-space:nowrap;';
  document.body.appendChild(tooltip);

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
      var count = data[key] || 0;
      var dateStr = year + '/' + (month + 1) + '/' + day;
      tooltip.textContent = dateStr + ': ' + count + ' 篇文章';
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 28) + 'px';
    } else {
      tooltip.style.display = 'none';
    }
  });

  canvas.addEventListener('mouseleave', function () {
    tooltip.style.display = 'none';
  });
})();
