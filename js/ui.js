/**
 * 奇门遁甲占卜工具 - 界面交互模块
 * 负责九宫格渲染、符号解读、元信息展示等UI逻辑
 */

// ============================================================
// 状态
// ============================================================

/** 当前激活的宫位编号（null 表示无） */
let activePalace = null;

/** 最近一次排盘结果缓存 */
let lastResult = null;

// ============================================================
// 常量：宫位在九宫格中的显示顺序（按洛书方位排列）
// 上排：巽4  离9  坤2
// 中排：震3  中5  兑7
// 下排：艮8  坎1  乾6
// ============================================================

const GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

// ============================================================
// 1. initPalaceGrid() - 初始化九宫格
// ============================================================

/**
 * 初始化九宫格
 * 创建9个宫位元素，每个宫位包含天盘、地盘、人盘、神盘显示区域，
 * 并绑定点击事件。
 */
function initPalaceGrid() {
  const grid = document.getElementById('palace-grid');
  if (!grid) return;

  grid.innerHTML = '';

  GRID_ORDER.forEach(function (palaceId) {
    var cell = document.createElement('div');
    cell.className = 'palace-cell fade-in';
    cell.setAttribute('data-palace', palaceId);

    // 宫位序号
    var numEl = document.createElement('span');
    numEl.className = 'palace-number';
    numEl.textContent = palaceId;
    cell.appendChild(numEl);

    // 神盘（八神）
    var shenEl = document.createElement('div');
    shenEl.className = 'layer layer-shen';
    shenEl.setAttribute('data-layer', 'shen');
    cell.appendChild(shenEl);

    // 天盘（九星）
    var starEl = document.createElement('div');
    starEl.className = 'layer layer-star symbol';
    starEl.setAttribute('data-layer', 'star');
    cell.appendChild(starEl);

    // 人盘（八门）
    var menEl = document.createElement('div');
    menEl.className = 'layer layer-men';
    menEl.setAttribute('data-layer', 'men');
    cell.appendChild(menEl);

    // 地盘（九宫名称）
    var gongEl = document.createElement('div');
    gongEl.className = 'layer layer-gong palace-name';
    gongEl.setAttribute('data-layer', 'gong');
    var gongData = Qimen.JIU_GONG[palaceId - 1];
    gongEl.textContent = gongData ? gongData.name : '';
    cell.appendChild(gongEl);

    // 点击事件
    cell.addEventListener('click', function () {
      handlePalaceClick(palaceId);
    });

    grid.appendChild(cell);
  });
}

// ============================================================
// 2. updatePalaceGrid(result) - 更新九宫格显示
// ============================================================

/**
 * 根据排盘结果更新每个宫位的内容
 * @param {object} result - calculateQimen() 返回的排盘结果
 */
function updatePalaceGrid(result) {
  if (!result || !result.palaces) return;

  lastResult = result;

  result.palaces.forEach(function (palace) {
    var cell = document.querySelector(
      '.palace-cell[data-palace="' + palace.id + '"]'
    );
    if (!cell) return;

    // 天盘 - 九星
    var starEl = cell.querySelector('[data-layer="star"]');
    if (starEl) {
      starEl.textContent = palace.star || '';
      // 绑定符号点击，查看九星详情
      starEl.onclick = function (e) {
        e.stopPropagation();
        if (palace.star) showSymbolDetail(palace.star, '九星');
      };
    }

    // 地盘 - 九宫（已在初始化时设置）
    var gongEl = cell.querySelector('[data-layer="gong"]');
    if (gongEl) {
      var gongData = Qimen.JIU_GONG[palace.id - 1];
      gongEl.textContent = gongData ? gongData.name : '';
    }

    // 人盘 - 八门
    var menEl = cell.querySelector('[data-layer="men"]');
    if (menEl) {
      menEl.textContent = palace.men || '';
      menEl.onclick = function (e) {
        e.stopPropagation();
        if (palace.men) showSymbolDetail(palace.men, '八门');
      };
    }

    // 神盘 - 八神
    var shenEl = cell.querySelector('[data-layer="shen"]');
    if (shenEl) {
      shenEl.textContent = palace.shen || '';
      shenEl.onclick = function (e) {
        e.stopPropagation();
        if (palace.shen) showSymbolDetail(palace.shen, '八神');
      };
    }
  });

  // 清除之前的激活状态
  activePalace = null;
  clearActivePalace();
}

// ============================================================
// 3. handlePalaceClick(palaceNum) - 处理宫位点击
// ============================================================

/**
 * 处理宫位点击：切换 active 状态并更新解读面板
 * @param {number} palaceNum - 宫位编号（1-9）
 */
function handlePalaceClick(palaceNum) {
  // 切换激活状态
  if (activePalace === palaceNum) {
    activePalace = null;
    clearActivePalace();
    resetInterpretation();
    return;
  }

  activePalace = palaceNum;

  // 更新 active 样式
  document.querySelectorAll('.palace-cell').forEach(function (cell) {
    cell.classList.remove('active');
  });
  var target = document.querySelector(
    '.palace-cell[data-palace="' + palaceNum + '"]'
  );
  if (target) {
    target.classList.add('active');
    target.classList.add('symbol-selected');
    setTimeout(function () {
      target.classList.remove('symbol-selected');
    }, 400);
  }

  // 更新解读面板
  updateInterpretation(palaceNum);
}

// ============================================================
// 4. updateInterpretation(palaceNum) - 更新解读面板
// ============================================================

/**
 * 更新解读面板：显示指定宫位的详细符号解读
 * @param {number} palaceNum - 宫位编号（1-9）
 */
function updateInterpretation(palaceNum) {
  var content = document.getElementById('interpretation-content');
  if (!content) return;

  // 从缓存中获取排盘结果
  if (!lastResult) {
    content.innerHTML = '<p style="color:var(--color-text-muted)">请先排盘</p>';
    return;
  }

  var palace = lastResult.palaces[palaceNum - 1];
  if (!palace) {
    content.innerHTML = '<p style="color:var(--color-text-muted)">无此宫位数据</p>';
    return;
  }

  var gongData = Symbols.getPalaceById(palaceNum);
  var html = '';

  // 宫位标题
  html += '<div class="symbol-title">' + (gongData ? gongData.name : '宫位' + palaceNum);
  if (gongData) {
    html += ' <span style="color:var(--color-text-muted);font-size:0.85rem">(' +
      gongData.direction + ' / ' + gongData.element + ')</span>';
  }
  html += '</div>';

  // 各盘符号解读
  var layers = [
    { label: '天盘（九星）', name: palace.star, category: '九星' },
    { label: '人盘（八门）', name: palace.men, category: '八门' },
    { label: '神盘（八神）', name: palace.shen, category: '八神' }
  ];

  layers.forEach(function (layer) {
    if (!layer.name) return;
    var info = Symbols.findSymbolByName(layer.name);
    if (!info) return;

    var luckClass = Symbols.getLuckClass(info.luck);
    html += '<div class="interpretation-item" style="margin-top:12px;padding:10px;' +
      'background:var(--color-bg-secondary);border-radius:var(--radius-sm);border-left:3px solid var(--color-accent-gold)">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
    html += '<span style="color:var(--color-text-muted);font-size:0.8rem">' + layer.label + '</span>';
    html += '<strong style="color:var(--color-accent-gold-light)">' + info.name + '</strong>';
    html += '<span class="' + luckClass + '" style="font-size:0.8rem;padding:1px 6px;' +
      'border-radius:3px;background:var(--color-bg-card)">' + info.luck + '</span>';
    html += '</div>';
    html += '<div style="font-size:0.85rem;color:var(--color-text-secondary)">';
    html += '<span>五行：' + info.element + '</span>';
    html += ' &middot; ';
    html += '<span>含义：' + info.meaning + '</span>';
    html += '</div>';
    html += '<div style="margin-top:6px;font-size:0.85rem;color:var(--color-text-muted);line-height:1.7">';
    html += info.explanation;
    html += '</div>';
    html += '</div>';
  });

  // 宫位本身信息
  if (gongData) {
    html += '<div class="interpretation-item" style="margin-top:12px;padding:10px;' +
      'background:var(--color-bg-secondary);border-radius:var(--radius-sm);border-left:3px solid var(--color-accent-cyan)">';
    html += '<div style="margin-bottom:6px">';
    html += '<span style="color:var(--color-text-muted);font-size:0.8rem">地盘（九宫）</span>';
    html += ' <strong style="color:var(--color-accent-gold-light)">' + gongData.name + '</strong>';
    html += '</div>';
    html += '<div style="font-size:0.85rem;color:var(--color-text-secondary)">';
    html += '方位：' + gongData.direction + ' / 五行：' + gongData.element;
    if (gongData.trigram) html += ' / 卦象：' + gongData.trigram;
    html += '</div>';
    html += '<div style="margin-top:6px;font-size:0.85rem;color:var(--color-text-muted);line-height:1.7">';
    html += gongData.meaning;
    html += '</div>';
    html += '</div>';
  }

  content.innerHTML = html;
  content.classList.add('slide-down');
  setTimeout(function () {
    content.classList.remove('slide-down');
  }, 400);
}

// ============================================================
// 5. updateMetaInfo(result) - 更新元信息显示
// ============================================================

/**
 * 更新元信息：四柱干支、阴阳遁、局数
 * @param {object} result - calculateQimen() 返回的排盘结果
 */
function updateMetaInfo(result) {
  if (!result) return;

  var gz = result.ganZhi;
  var ju = result.juInfo;

  // 在输入区域下方插入或更新元信息面板
  var metaEl = document.getElementById('meta-info');
  if (!metaEl) {
    metaEl = document.createElement('div');
    metaEl.id = 'meta-info';
    metaEl.className = 'meta-info fade-in';
    metaEl.style.cssText =
      'display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:16px;padding:12px;' +
      'background:var(--color-bg-secondary);border-radius:var(--radius-md);border:1px solid var(--color-border)';

    var inputSection = document.querySelector('.input-section');
    if (inputSection) {
      inputSection.appendChild(metaEl);
    }
  }

  var items = [
    { label: '年柱', value: gz.year.gz },
    { label: '月柱', value: gz.month.gz },
    { label: '日柱', value: gz.day.gz },
    { label: '时柱', value: gz.hour.gz },
    { label: '遁', value: ju.yinYang },
    { label: '局', value: ju.juNumber + '局' }
  ];

  metaEl.innerHTML = items
    .map(function (item) {
      return (
        '<div style="text-align:center">' +
        '<div style="font-size:0.75rem;color:var(--color-text-muted)">' +
        item.label +
        '</div>' +
        '<div style="font-size:1rem;color:var(--color-accent-gold);font-weight:600">' +
        item.value +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

// ============================================================
// 6. showLoading() / showError(message) / resetInterpretation()
// ============================================================

/**
 * 显示加载状态
 */
function showLoading() {
  var content = document.getElementById('interpretation-content');
  if (content) {
    content.innerHTML =
      '<div style="text-align:center;padding:20px">' +
      '<div class="loader" style="margin:0 auto 12px"></div>' +
      '<p style="color:var(--color-text-muted)">正在排盘...</p>' +
      '</div>';
  }

  // 禁用排盘按钮
  var btn = document.getElementById('calculate-btn');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }
}

/**
 * 显示错误信息
 * @param {string} message - 错误提示
 */
function showError(message) {
  var content = document.getElementById('interpretation-content');
  if (content) {
    content.innerHTML =
      '<div style="text-align:center;padding:20px">' +
      '<p style="color:var(--color-accent-red);font-weight:600">' +
      message +
      '</p>' +
      '</div>';
  }

  // 恢复排盘按钮
  var btn = document.getElementById('calculate-btn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// ============================================================
// 辅助函数
// ============================================================

/** 清除所有宫位的 active 状态 */
function clearActivePalace() {
  document.querySelectorAll('.palace-cell').forEach(function (cell) {
    cell.classList.remove('active');
  });
}

/** 重置解读面板为默认提示 */
function resetInterpretation() {
  var content = document.getElementById('interpretation-content');
  if (content) {
    content.innerHTML = '点击任意符号查看详细解释';
  }
}

/**
 * 显示单个符号的详细信息（点击星/门/神时触发）
 * @param {string} name - 符号名称
 * @param {string} category - 分类（九星/八门/八神）
 */
function showSymbolDetail(name, category) {
  var content = document.getElementById('interpretation-content');
  if (!content) return;

  var info = Symbols.findSymbolByName(name);
  if (!info) return;

  var luckClass = Symbols.getLuckClass(info.luck);
  var html = '';

  html += '<div class="symbol-title">' + info.name + ' <span style="font-size:0.85rem;color:var(--color-text-muted)">(' + category + ')</span></div>';
  html += '<div style="margin-bottom:8px">';
  html += '<span class="' + luckClass + '" style="padding:2px 8px;border-radius:3px;font-size:0.85rem">' + info.luck + '</span>';
  html += ' <span style="color:var(--color-text-secondary);margin-left:8px">五行：' + info.element + '</span>';
  html += ' <span style="color:var(--color-text-secondary);margin-left:8px">含义：' + info.meaning + '</span>';
  html += '</div>';
  html += '<div class="symbol-description" style="margin-bottom:12px;font-size:0.9rem;color:var(--color-text-secondary);line-height:1.8">';
  html += info.explanation;
  html += '</div>';

  if (info.examples && info.examples.length > 0) {
    html += '<div style="margin-top:8px">';
    html += '<div style="font-size:0.85rem;color:var(--color-accent-gold);margin-bottom:6px">示例：</div>';
    html += '<ul style="list-style:none;padding:0">';
    info.examples.forEach(function (ex) {
      html += '<li style="font-size:0.85rem;color:var(--color-text-muted);padding:3px 0;padding-left:12px;border-left:2px solid var(--color-border)">' + ex + '</li>';
    });
    html += '</ul>';
    html += '</div>';
  }

  content.innerHTML = html;
  content.classList.add('slide-down');
  setTimeout(function () {
    content.classList.remove('slide-down');
  }, 400);
}

// ============================================================
// 导出
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPalaceGrid,
    updatePalaceGrid,
    handlePalaceClick,
    updateInterpretation,
    updateMetaInfo,
    showLoading,
    showError
  };
} else if (typeof window !== 'undefined') {
  window.UI = {
    initPalaceGrid,
    updatePalaceGrid,
    handlePalaceClick,
    updateInterpretation,
    updateMetaInfo,
    showLoading,
    showError
  };
}
