/**
 * 奇门遁甲占卜工具 - 主应用模块
 * 整合排盘算法、符号数据和界面交互，提供完整的应用逻辑
 * 教学和研究用途
 */

// ============================================================
// 全局状态
// ============================================================

/** 当前排盘结果 */
window.currentResult = null;

/** 符号数据引用（从 symbols.js 模块获取） */
window.SYMBOLS_DATA = null;

// ============================================================
// 1. initApp() - 初始化应用
// ============================================================

/**
 * 初始化应用
 * 加载符号数据、初始化界面、设置默认时间、绑定事件
 */
function initApp() {
  loadSymbolsData();
  UI.initPalaceGrid();
  setDefaultTime();
  bindEvents();

  // 初始化星空背景
  if (typeof initStarryBackground === 'function') {
    initStarryBackground();
  }

  // 默认显示引导标签页
  handleTabSwitch('guide');
}

// ============================================================
// 2. loadSymbolsData() - 加载符号数据
// ============================================================

/**
 * 加载符号数据
 * 从 symbols.js 导出的 Symbols 对象中获取数据
 */
function loadSymbolsData() {
  if (typeof Symbols !== 'undefined') {
    window.SYMBOLS_DATA = {
      jiuXing: Symbols.JIU_XING_DATA,
      baMen: Symbols.BA_MEN_DATA,
      baShen: Symbols.BA_SHEN_DATA,
      jiuGong: Symbols.JIU_GONG_DATA
    };
  } else {
    window.SYMBOLS_DATA = {
      jiuXing: [],
      baMen: [],
      baShen: [],
      jiuGong: []
    };
  }
}

// ============================================================
// 3. setDefaultTime() - 设置默认时间为当前时间
// ============================================================

/**
 * 设置默认时间为当前时间
 * 将 datetime-local 输入框设为当前日期时间
 */
function setDefaultTime() {
  var datetimeInput = document.getElementById('datetime');
  if (!datetimeInput) return;

  var now = new Date();
  var year = now.getFullYear();
  var month = String(now.getMonth() + 1).padStart(2, '0');
  var day = String(now.getDate()).padStart(2, '0');
  var hour = String(now.getHours()).padStart(2, '0');
  var minute = String(now.getMinutes()).padStart(2, '0');

  datetimeInput.value = year + '-' + month + '-' + day + 'T' + hour + ':' + minute;
}

// ============================================================
// 4. bindEvents() - 绑定事件
// ============================================================

/**
 * 绑定所有界面事件
 * 包括排盘按钮、重置按钮、标签页切换
 */
function bindEvents() {
  // 排盘按钮
  var calculateBtn = document.getElementById('calculate-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculate);
  }

  // 重置按钮
  var resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }

  // 标签页切换
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = this.getAttribute('data-tab');
      handleTabSwitch(tabName);
    });
  });
}

// ============================================================
// 5. handleCalculate() - 处理排盘
// ============================================================

/**
 * 处理排盘
 * 获取时间输入，调用 calculateQimen() 计算，更新界面显示
 */
function handleCalculate() {
  var datetimeInput = document.getElementById('datetime');
  if (!datetimeInput || !datetimeInput.value) {
    UI.showError('请选择排盘时间');
    return;
  }

  // 解析时间
  var parts = datetimeInput.value.split('T');
  if (parts.length !== 2) {
    UI.showError('时间格式不正确');
    return;
  }

  var dateParts = parts[0].split('-');
  var timeParts = parts[1].split(':');

  var year = parseInt(dateParts[0], 10);
  var month = parseInt(dateParts[1], 10);
  var day = parseInt(dateParts[2], 10);
  var hour = parseInt(timeParts[0], 10);

  // 验证时间
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
    UI.showError('请输入有效的时间');
    return;
  }

  // 获取所问之事
  var questionInput = document.getElementById('question');
  var question = questionInput ? questionInput.value.trim() : '';

  // 显示加载状态
  UI.showLoading();

  // 使用 setTimeout 让 UI 有时间更新
  setTimeout(function () {
    try {
      // 调用排盘算法
      var result = Qimen.calculateQimen(year, month, day, hour);
      window.currentResult = result;

      // 更新界面
      UI.updatePalaceGrid(result);
      UI.updateMetaInfo(result);

      // 生成总结盘象和分析建议
      generateSummaryAndAnalysis(result, question);

      // 清除加载状态，显示默认提示
      var interpretationContent = document.getElementById('interpretation-content');
      if (interpretationContent) {
        interpretationContent.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:20px">点击任意宫位查看详细解读</p>';
      }

      // 恢复按钮状态
      var btn = document.getElementById('calculate-btn');
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    } catch (error) {
      UI.showError('排盘计算出错：' + error.message);
    }
  }, 100);
}

// ============================================================
// 6. generateSummaryAndAnalysis() - 生成总结盘象和分析建议
// ============================================================

/**
 * 生成总结盘象和分析建议
 * @param {object} result - 排盘结果
 * @param {string} question - 所问之事
 */
function generateSummaryAndAnalysis(result, question) {
  if (!result || !result.palaces) return;

  // 显示总结盘象区域
  var summarySection = document.getElementById('summary-section');
  var analysisSection = document.getElementById('analysis-section');
  if (summarySection) summarySection.style.display = 'block';
  if (analysisSection) analysisSection.style.display = 'block';

  // 获取用神宫位（根据问题类型）
  var shenPalace = getShenPalace(result, question);

  // 生成总结盘象
  var summaryHtml = generateSummary(result, question, shenPalace);
  var summaryContent = document.getElementById('summary-content');
  if (summaryContent) summaryContent.innerHTML = summaryHtml;

  // 生成分析与建议
  var analysisHtml = generateAnalysis(result, question, shenPalace);
  var analysisContent = document.getElementById('analysis-content');
  if (analysisContent) analysisContent.innerHTML = analysisHtml;
}

/**
 * 根据问题类型获取用神宫位
 * @param {object} result - 排盘结果
 * @param {string} question - 所问之事
 * @returns {object} 用神宫位信息
 */
function getShenPalace(result, question) {
  var questionLower = question.toLowerCase();
  var shenType = 'general';

  // 根据关键词判断问题类型
  if (questionLower.includes('事业') || questionLower.includes('工作') || questionLower.includes('官') || questionLower.includes('升职')) {
    shenType = 'career';
  } else if (questionLower.includes('财') || questionLower.includes('钱') || questionLower.includes('投资') || questionLower.includes('生意')) {
    shenType = 'wealth';
  } else if (questionLower.includes('感情') || questionLower.includes('婚姻') || questionLower.includes('爱情') || questionLower.includes('对象')) {
    shenType = 'love';
  } else if (questionLower.includes('健康') || questionLower.includes('病') || questionLower.includes('身体')) {
    shenType = 'health';
  } else if (questionLower.includes('考试') || questionLower.includes('学业') || questionLower.includes('学习')) {
    shenType = 'study';
  } else if (questionLower.includes('出行') || questionLower.includes('旅游') || questionLower.includes('出差')) {
    shenType = 'travel';
  }

  // 找到用神宫位
  var shenPalace = null;
  var palaces = result.palaces;

  for (var i = 0; i < palaces.length; i++) {
    var palace = palaces[i];
    var star = findSymbolByName(palace.star, 'star');
    var men = findSymbolByName(palace.men, 'men');
    var shen = findSymbolByName(palace.shen, 'shen');

    // 根据用神类型选择宫位
    if (shenType === 'career' && (palace.men === '开门' || palace.men === '休门')) {
      shenPalace = palace;
      break;
    } else if (shenType === 'wealth' && (palace.men === '生门' || palace.star === '天心')) {
      shenPalace = palace;
      break;
    } else if (shenType === 'love' && (palace.shen === '六合' || palace.shen === '太阴')) {
      shenPalace = palace;
      break;
    } else if (shenType === 'health' && (palace.star === '天芮' || palace.men === '死门')) {
      shenPalace = palace;
      break;
    } else if (shenType === 'study' && (palace.star === '天辅' || palace.men === '景门')) {
      shenPalace = palace;
      break;
    } else if (shenType === 'travel' && (palace.men === '开门' || palace.shen === '九天')) {
      shenPalace = palace;
      break;
    }
  }

  // 如果没有找到特定用神，使用值符所在宫位
  if (!shenPalace) {
    for (var j = 0; j < palaces.length; j++) {
      if (palaces[j].shen === '值符') {
        shenPalace = palaces[j];
        break;
      }
    }
  }

  // 如果还是没有，使用第一个宫位
  if (!shenPalace && palaces.length > 0) {
    shenPalace = palaces[0];
  }

  return {
    palace: shenPalace,
    type: shenType
  };
}

/**
 * 查找符号数据
 * @param {string} name - 符号名称
 * @param {string} type - 符号类型（star/men/shen）
 * @returns {object|null} 符号数据
 */
function findSymbolByName(name, type) {
  if (!window.SYMBOLS_DATA) return null;

  var data;
  switch (type) {
    case 'star':
      data = window.SYMBOLS_DATA.jiuXing;
      break;
    case 'men':
      data = window.SYMBOLS_DATA.baMen;
      break;
    case 'shen':
      data = window.SYMBOLS_DATA.baShen;
      break;
    default:
      return null;
  }

  if (!data) return null;

  for (var i = 0; i < data.length; i++) {
    if (data[i].name === name) {
      return data[i];
    }
  }
  return null;
}

/**
 * 生成总结盘象HTML
 * @param {object} result - 排盘结果
 * @param {string} question - 所问之事
 * @param {object} shenPalace - 用神宫位信息
 * @returns {string} HTML内容
 */
function generateSummary(result, question, shenPalace) {
  var html = '<div class="summary-content">';
  html += '<div class="summary-title">盘象总结</div>';

  // 基本信息 - 适配新的数据结构
  html += '<div class="summary-item">';
  html += '<div class="summary-label">排盘信息</div>';
  html += '<div class="summary-text">';
  html += result.ganZhi.year.gz + '年 ' + result.ganZhi.month.gz + '月 ';
  html += result.ganZhi.day.gz + '日 ' + result.ganZhi.hour.gz + '时';
  html += ' | ' + result.juInfo.display;
  html += '</div>';
  html += '</div>';

  // 所问之事
  if (question) {
    html += '<div class="summary-item">';
    html += '<div class="summary-label">所问之事</div>';
    html += '<div class="summary-text">' + escapeHtml(question) + '</div>';
    html += '</div>';
  }

  // 用神宫位
  if (shenPalace && shenPalace.palace) {
    var palace = shenPalace.palace;
    var starData = findSymbolByName(palace.star, 'star');
    var menData = findSymbolByName(palace.men, 'men');
    var shenData = findSymbolByName(palace.shen, 'shen');

    html += '<div class="summary-item">';
    html += '<div class="summary-label">用神宫位（' + palace.name + '）</div>';
    html += '<div class="summary-text">';

    if (starData) {
      html += '<div>天盘：<strong>' + palace.star + '</strong>';
      html += ' <span class="luck-indicator luck-' + getLuckClass(starData.luck) + '">' + starData.luck + '</span>';
      html += ' - ' + starData.meaning + '</div>';
    }

    if (menData) {
      html += '<div>人盘：<strong>' + palace.men + '</strong>';
      html += ' <span class="luck-indicator luck-' + getLuckClass(menData.luck) + '">' + menData.luck + '</span>';
      html += ' - ' + menData.meaning + '</div>';
    }

    if (shenData) {
      html += '<div>神盘：<strong>' + palace.shen + '</strong>';
      html += ' <span class="luck-indicator luck-' + getLuckClass(shenData.luck) + '">' + shenData.luck + '</span>';
      html += ' - ' + shenData.meaning + '</div>';
    }

    html += '</div>';
    html += '</div>';
  }

  // 格局判断
  html += '<div class="summary-item">';
  html += '<div class="summary-label">整体格局</div>';
  html += '<div class="summary-text">' + getOverallPattern(result) + '</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

/**
 * 生成分析与建议HTML
 * @param {object} result - 排盘结果
 * @param {string} question - 所问之事
 * @param {object} shenPalace - 用神宫位信息
 * @returns {string} HTML内容
 */
function generateAnalysis(result, question, shenPalace) {
  var html = '<div class="analysis-content">';
  html += '<div class="analysis-title">分析与建议</div>';

  // 根据用神类型生成分析
  if (shenPalace && shenPalace.palace) {
    var palace = shenPalace.palace;
    var starData = findSymbolByName(palace.star, 'star');
    var menData = findSymbolByName(palace.men, 'men');
    var shenData = findSymbolByName(palace.shen, 'shen');

    // 用神分析
    html += '<div class="analysis-item">';
    html += '<div class="analysis-label">用神分析</div>';
    html += '<div class="analysis-text">';
    html += getShenAnalysis(shenPalace.type, starData, menData, shenData);
    html += '</div>';
    html += '</div>';

    // 吉凶判断
    html += '<div class="analysis-item">';
    html += '<div class="analysis-label">吉凶判断</div>';
    html += '<div class="analysis-text">';
    html += getLuckAnalysis(starData, menData, shenData);
    html += '</div>';
    html += '</div>';

    // 行动建议
    html += '<div class="analysis-item">';
    html += '<div class="analysis-label">行动建议</div>';
    html += '<div class="analysis-text">';
    html += getActionAdvice(shenPalace.type, starData, menData, shenData);
    html += '</div>';
    html += '</div>';

    // 时间建议
    html += '<div class="analysis-item">';
    html += '<div class="analysis-label">时间建议</div>';
    html += '<div class="analysis-text">';
    html += getTimeAdvice(result, shenPalace);
    html += '</div>';
    html += '</div>';

    // 注意事项
    html += '<div class="analysis-item">';
    html += '<div class="analysis-label">注意事项</div>';
    html += '<div class="analysis-text">';
    html += get注意事项(starData, menData, shenData);
    html += '</div>';
    html += '</div>';
  } else {
    html += '<div class="analysis-item">';
    html += '<div class="analysis-text">请先输入所问之事，以便进行针对性分析。</div>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * 获取宫位名称
 * @param {number} id - 宫位ID
 * @returns {string} 宫位名称
 */
function getGongName(id) {
  var names = ['', '坎一宫', '坤二宫', '震三宫', '巽四宫', '中五宫', '乾六宫', '兑七宫', '艮八宫', '离九宫'];
  return names[id] || '未知宫位';
}

/**
 * 获取吉凶等级样式类
 * @param {string} luck - 吉凶等级
 * @returns {string} CSS类名
 */
function getLuckClass(luck) {
  if (!luck) return 'neutral';
  if (luck.includes('大吉')) return 'great';
  if (luck.includes('吉')) return 'good';
  if (luck.includes('凶')) return 'bad';
  if (luck.includes('大凶')) return 'terrible';
  return 'neutral';
}

/**
 * 获取整体格局描述
 * @param {object} result - 排盘结果
 * @returns {string} 格局描述
 */
function getOverallPattern(result) {
  var goodCount = 0;
  var badCount = 0;
  var neutralCount = 0;

  result.palaces.forEach(function (palace) {
    var starData = findSymbolByName(palace.star, 'star');
    var menData = findSymbolByName(palace.men, 'men');

    if (starData) {
      if (starData.luck.includes('吉')) goodCount++;
      else if (starData.luck.includes('凶')) badCount++;
      else neutralCount++;
    }

    if (menData) {
      if (menData.luck.includes('吉')) goodCount++;
      else if (menData.luck.includes('凶')) badCount++;
      else neutralCount++;
    }
  });

  if (goodCount > badCount + neutralCount) {
    return '整体格局<span class="luck-indicator luck-good">吉</span>，天时地利人和，诸事顺利，可积极进取。';
  } else if (badCount > goodCount + neutralCount) {
    return '整体格局<span class="luck-indicator luck-bad">凶</span>，阻碍较多，宜谨慎守成，不宜冒进。';
  } else {
    return '整体格局<span class="luck-indicator luck-neutral">平</span>，吉凶参半，需审时度势，把握时机。';
  }
}

/**
 * 获取用神分析
 * @param {string} type - 用神类型
 * @param {object} starData - 星数据
 * @param {object} menData - 门数据
 * @param {object} shenData - 神数据
 * @returns {string} 分析内容
 */
function getShenAnalysis(type, starData, menData, shenData) {
  var analysis = '';

  switch (type) {
    case 'career':
      analysis = '问事业，以开门、休门为用神。';
      if (menData) {
        if (menData.name === '开门') {
          analysis += '开门为事业之门，主开创、顺利，事业有新的开始之象。';
        } else if (menData.name === '休门') {
          analysis += '休门主安逸、贵人，事业上有贵人相助，工作轻松顺利。';
        } else if (menData.name === '生门') {
          analysis += '生门主生长、财富，事业蓬勃发展，财运亨通。';
        } else if (menData.name === '伤门') {
          analysis += '伤门主伤害、损失，事业上有阻碍，需谨慎行事。';
        } else if (menData.name === '杜门') {
          analysis += '杜门主闭塞、隐藏，事业发展受阻，宜韬光养晦。';
        } else if (menData.name === '景门') {
          analysis += '景门主文书、考试，事业与文书、文化相关，利考试升迁。';
        } else if (menData.name === '死门') {
          analysis += '死门主结束、固执，事业有终结之象，需考虑转型。';
        } else if (menData.name === '惊门') {
          analysis += '惊门主惊恐、担忧，事业有意外变故，需冷静应对。';
        }
      }
      break;

    case 'wealth':
      analysis = '问财运，以生门为用神。';
      if (menData) {
        if (menData.name === '生门') {
          analysis += '生门为财帛之门，主财源广进，投资获利。';
        } else if (menData.name === '开门') {
          analysis += '开门主顺利，财运亨通，适合开拓新的财源。';
        } else if (menData.name === '休门') {
          analysis += '休门主贵人，有贵人指点，财运稳定。';
        } else if (menData.name === '伤门') {
          analysis += '伤门主损失，财运不佳，投资需谨慎。';
        } else if (menData.name === '杜门') {
          analysis += '杜门主闭塞，财路受阻，不宜投资。';
        } else if (menData.name === '景门') {
          analysis += '景门主虚华，财运表面风光，实际不稳。';
        } else if (menData.name === '死门') {
          analysis += '死门主终结，财运有破败之象，需谨慎守财。';
        } else if (menData.name === '惊门') {
          analysis += '惊门主意外，财运有突发变故，需防范风险。';
        }
      }
      break;

    case 'love':
      analysis = '问感情，以六合、太阴为用神。';
      if (shenData) {
        if (shenData.name === '六合') {
          analysis += '六合主合作、和谐，感情顺利，双方情投意合。';
        } else if (shenData.name === '太阴') {
          analysis += '太阴主阴私、暗中，感情有隐情，或有暗恋之象。';
        } else if (shenData.name === '值符') {
          analysis += '值符主贵人，感情有贵人相助，关系稳定。';
        } else if (shenData.name === '腾蛇') {
          analysis += '腾蛇主虚惊，感情有波折，但多为虚惊一场。';
        } else if (shenData.name === '白虎') {
          analysis += '白虎主凶伤，感情有伤害，需谨慎处理。';
        } else if (shenData.name === '玄武') {
          analysis += '玄武主欺骗，感情有隐瞒，需防范欺骗。';
        } else if (shenData.name === '九地') {
          analysis += '九地主稳定，感情稳定发展，关系稳固。';
        } else if (shenData.name === '九天') {
          analysis += '九天主高远，感情有上升之象，关系向好发展。';
        }
      }
      break;

    case 'health':
      analysis = '问健康，以天芮星、死门为用神。';
      if (starData) {
        if (starData.name === '天芮') {
          analysis += '天芮主疾病，健康有隐患，需注意身体检查。';
        } else if (starData.name === '天心') {
          analysis += '天心主治疗，健康有保障，疾病可愈。';
        } else if (starData.name === '天蓬') {
          analysis += '天蓬主暗昧，健康有隐疾，需仔细检查。';
        } else {
          analysis += '天盘' + starData.name + '临宫，' + starData.meaning + '。';
        }
      }
      break;

    case 'study':
      analysis = '问学业，以天辅星、景门为用神。';
      if (starData) {
        if (starData.name === '天辅') {
          analysis += '天辅主文雅、教化，学业顺利，考试有利。';
        } else if (starData.name === '天心') {
          analysis += '天心主智慧，学业有成，思维敏捷。';
        } else {
          analysis += '天盘' + starData.name + '临宫，' + starData.meaning + '。';
        }
      }
      if (menData) {
        if (menData.name === '景门') {
          analysis += '景门主文书、考试，学业有成，考试顺利。';
        } else if (menData.name === '杜门') {
          analysis += '杜门主闭塞，学业受阻，需加倍努力。';
        }
      }
      break;

    case 'travel':
      analysis = '问出行，以开门、九天为用神。';
      if (menData) {
        if (menData.name === '开门') {
          analysis += '开门主顺利，出行顺利，一路平安。';
        } else if (menData.name === '伤门') {
          analysis += '伤门主伤害，出行有险，需注意安全。';
        } else if (menData.name === '惊门') {
          analysis += '惊门主惊恐，出行有惊，但多为虚惊。';
        }
      }
      if (shenData) {
        if (shenData.name === '九天') {
          analysis += '九天主高远，出行顺利，可得高位。';
        } else if (shenData.name === '九地') {
          analysis += '九地主稳定，出行平稳，但进展缓慢。';
        }
      }
      break;

    default:
      analysis = '综合分析：';
      if (starData) {
        analysis += '天盘' + starData.name + '，' + starData.meaning + '。';
      }
      if (menData) {
        analysis += '人盘' + menData.name + '，' + menData.meaning + '。';
      }
      if (shenData) {
        analysis += '神盘' + shenData.name + '，' + shenData.meaning + '。';
      }
  }

  return analysis;
}

/**
 * 获取吉凶分析
 * @param {object} starData - 星数据
 * @param {object} menData - 门数据
 * @param {object} shenData - 神数据
 * @returns {string} 吉凶分析
 */
function getLuckAnalysis(starData, menData, shenData) {
  var goodCount = 0;
  var badCount = 0;
  var details = [];

  if (starData) {
    if (starData.luck.includes('吉')) {
      goodCount++;
      details.push('天盘' + starData.name + '<span class="luck-indicator luck-good">' + starData.luck + '</span>');
    } else if (starData.luck.includes('凶')) {
      badCount++;
      details.push('天盘' + starData.name + '<span class="luck-indicator luck-bad">' + starData.luck + '</span>');
    } else {
      details.push('天盘' + starData.name + '<span class="luck-indicator luck-neutral">' + starData.luck + '</span>');
    }
  }

  if (menData) {
    if (menData.luck.includes('吉')) {
      goodCount++;
      details.push('人盘' + menData.name + '<span class="luck-indicator luck-good">' + menData.luck + '</span>');
    } else if (menData.luck.includes('凶')) {
      badCount++;
      details.push('人盘' + menData.name + '<span class="luck-indicator luck-bad">' + menData.luck + '</span>');
    } else {
      details.push('人盘' + menData.name + '<span class="luck-indicator luck-neutral">' + menData.luck + '</span>');
    }
  }

  if (shenData) {
    if (shenData.luck.includes('吉')) {
      goodCount++;
      details.push('神盘' + shenData.name + '<span class="luck-indicator luck-good">' + shenData.luck + '</span>');
    } else if (shenData.luck.includes('凶')) {
      badCount++;
      details.push('神盘' + shenData.name + '<span class="luck-indicator luck-bad">' + shenData.luck + '</span>');
    } else {
      details.push('神盘' + shenData.name + '<span class="luck-indicator luck-neutral">' + shenData.luck + '</span>');
    }
  }

  var result = details.join('，') + '。';

  if (goodCount > badCount) {
    result += '整体<span class="luck-indicator luck-good">吉</span>，可积极进取。';
  } else if (badCount > goodCount) {
    result += '整体<span class="luck-indicator luck-bad">凶</span>，宜谨慎守成。';
  } else {
    result += '整体<span class="luck-indicator luck-neutral">平</span>，需审时度势。';
  }

  return result;
}

/**
 * 获取行动建议
 * @param {string} type - 用神类型
 * @param {object} starData - 星数据
 * @param {object} menData - 门数据
 * @param {object} shenData - 神数据
 * @returns {string} 行动建议
 */
function getActionAdvice(type, starData, menData, shenData) {
  var advice = '';

  // 根据吉凶给出建议
  var isGood = false;
  var isBad = false;

  if (starData) {
    if (starData.luck.includes('吉')) isGood = true;
    if (starData.luck.includes('凶')) isBad = true;
  }
  if (menData) {
    if (menData.luck.includes('吉')) isGood = true;
    if (menData.luck.includes('凶')) isBad = true;
  }
  if (shenData) {
    if (shenData.luck.includes('吉')) isGood = true;
    if (shenData.luck.includes('凶')) isBad = true;
  }

  if (isGood && !isBad) {
    advice = '<span class="luck-indicator luck-good">宜主动出击</span>，把握时机，积极行动。';
  } else if (isBad && !isGood) {
    advice = '<span class="luck-indicator luck-bad">宜谨慎守成</span>，不宜冒进，等待时机。';
  } else {
    advice = '<span class="luck-indicator luck-neutral">宜审时度势</span>，根据实际情况灵活应对。';
  }

  // 根据具体符号给出建议
  if (menData) {
    if (menData.name === '开门') {
      advice += '开门主顺利，适合开拓、创新、开始新的项目。';
    } else if (menData.name === '休门') {
      advice += '休门主休息，适合休养、调整、等待时机。';
    } else if (menData.name === '生门') {
      advice += '生门主生长，适合投资、理财、发展事业。';
    } else if (menData.name === '伤门') {
      advice += '伤门主伤害，需谨慎行事，避免冲动。';
    } else if (menData.name === '杜门') {
      advice += '杜门主闭塞，适合隐藏、保密、韬光养晦。';
    } else if (menData.name === '景门') {
      advice += '景门主文书，适合考试、签约、文书工作。';
    } else if (menData.name === '死门') {
      advice += '死门主结束，适合结束旧事、清理、整顿。';
    } else if (menData.name === '惊门') {
      advice += '惊门主惊恐，需冷静应对，避免恐慌。';
    }
  }

  return advice;
}

/**
 * 获取时间建议
 * @param {object} result - 排盘结果
 * @param {object} shenPalace - 用神宫位信息
 * @returns {string} 时间建议
 */
function getTimeAdvice(result, shenPalace) {
  var advice = '';

  // 根据局数判断时机 - 适配新的数据结构
  var juNumber = result.juInfo.juNumber;
  var yinYang = result.juInfo.yinYang;

  if (yinYang === '阳') {
    if (juNumber <= 3) {
      advice = '阳遁' + juNumber + '局，处于阳气上升阶段，适合主动出击，把握时机。';
    } else if (juNumber <= 6) {
      advice = '阳遁' + juNumber + '局，处于阳气旺盛阶段，适合积极行动，大展宏图。';
    } else {
      advice = '阳遁' + juNumber + '局，处于阳气渐衰阶段，适合收尾、总结、准备下一阶段。';
    }
  } else {
    if (juNumber <= 3) {
      advice = '阴遁' + juNumber + '局，处于阴气上升阶段，适合韬光养晦，积蓄力量。';
    } else if (juNumber <= 6) {
      advice = '阴遁' + juNumber + '局，处于阴气旺盛阶段，适合守成、巩固、稳定发展。';
    } else {
      advice = '阴遁' + juNumber + '局，处于阴气渐衰阶段，适合准备、规划、等待时机。';
    }
  }

  // 根据时辰给出建议
  var hour = result.input.hour;
  if (hour >= 5 && hour < 7) {
    advice += '卯时（5-7点），阳气初升，适合开始新的事情。';
  } else if (hour >= 7 && hour < 9) {
    advice += '辰时（7-9点），阳气渐旺，适合处理重要事务。';
  } else if (hour >= 9 && hour < 11) {
    advice += '巳时（9-11点），阳气正旺，适合决策、行动。';
  } else if (hour >= 11 && hour < 13) {
    advice += '午时（11-13点），阳气最旺，适合重要决策。';
  } else if (hour >= 13 && hour < 15) {
    advice += '未时（13-15点），阳气渐衰，适合收尾、总结。';
  } else if (hour >= 15 && hour < 17) {
    advice += '申时（15-17点），阳气渐弱，适合处理次要事务。';
  } else if (hour >= 17 && hour < 19) {
    advice += '酉时（17-19点），阳气渐消，适合休息、调整。';
  } else if (hour >= 19 && hour < 21) {
    advice += '戌时（19-21点），阴气渐生，适合思考、规划。';
  } else if (hour >= 21 && hour < 23) {
    advice += '亥时（21-23点），阴气渐旺，适合休息、准备。';
  } else if (hour >= 23 || hour < 1) {
    advice += '子时（23-1点），阴气最旺，适合休息、静养。';
  } else if (hour >= 1 && hour < 3) {
    advice += '丑时（1-3点），阴气渐衰，适合休息、恢复。';
  } else if (hour >= 3 && hour < 5) {
    advice += '寅时（3-5点），阳气初生，适合准备、规划。';
  }

  return advice;
}

/**
 * 获取注意事项
 * @param {object} starData - 星数据
 * @param {object} menData - 门数据
 * @param {object} shenData - 神数据
 * @returns {string} 注意事项
 */
function get注意事项(starData, menData, shenData) {
  var 注意事项 = [];

  if (starData) {
    if (starData.name === '天蓬') {
      注意事项.push('天蓬主盗贼，需防范盗窃、欺骗。');
    } else if (starData.name === '天芮') {
      注意事项.push('天芮主疾病，需注意身体健康。');
    } else if (starData.name === '天冲') {
      注意事项.push('天冲主冲动，需避免急躁行事。');
    } else if (starData.name === '天柱') {
      注意事项.push('天柱主口舌，需防范争吵、是非。');
    } else if (starData.name === '天英') {
      注意事项.push('天英主虚华，需防范表面风光、实际不稳。');
    }
  }

  if (menData) {
    if (menData.name === '伤门') {
      注意事项.push('伤门主伤害，需注意安全，防范意外。');
    } else if (menData.name === '死门') {
      注意事项.push('死门主结束，需防范破败、损失。');
    } else if (menData.name === '惊门') {
      注意事项.push('惊门主惊恐，需保持冷静，避免恐慌。');
    }
  }

  if (shenData) {
    if (shenData.name === '腾蛇') {
      注意事项.push('腾蛇主虚惊，需防范惊吓、怪事。');
    } else if (shenData.name === '白虎') {
      注意事项.push('白虎主凶伤，需防范血光之灾。');
    } else if (shenData.name === '玄武') {
      注意事项.push('玄武主欺骗，需防范盗窃、诈骗。');
    }
  }

  if (注意事项.length === 0) {
    注意事项.push('整体平稳，无特殊注意事项。');
  }

  return 注意事项.join('');
}

/**
 * HTML转义
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ============================================================
// 7. handleReset() - 处理重置
// ============================================================

/**
 * 处理重置
 * 重置时间输入、清空排盘结果、重新初始化界面
 */
function handleReset() {
  // 清空排盘结果
  window.currentResult = null;

  // 重置时间输入
  setDefaultTime();

  // 清空问题输入
  var questionInput = document.getElementById('question');
  if (questionInput) {
    questionInput.value = '';
  }

  // 重新初始化九宫格
  UI.initPalaceGrid();

  // 重置解读面板
  var content = document.getElementById('interpretation-content');
  if (content) {
    content.innerHTML = '点击任意符号查看详细解释';
  }

  // 清除元信息
  var metaEl = document.getElementById('meta-info');
  if (metaEl) {
    metaEl.remove();
  }

  // 隐藏总结盘象和分析建议区域
  var summarySection = document.getElementById('summary-section');
  var analysisSection = document.getElementById('analysis-section');
  if (summarySection) summarySection.style.display = 'none';
  if (analysisSection) analysisSection.style.display = 'none';
}

// ============================================================
// 7. handleTabSwitch(tab) - 处理标签页切换
// ============================================================

/**
 * 处理标签页切换
 * @param {string} tab - 标签页名称（guide/cases/knowledge）
 */
function handleTabSwitch(tab) {
  // 更新标签页激活状态
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tabEl) {
    tabEl.classList.remove('active');
    if (tabEl.getAttribute('data-tab') === tab) {
      tabEl.classList.add('active');
    }
  });

  // 更新标签页内容
  var tabContent = document.getElementById('tab-content');
  if (!tabContent) return;

  var html = '';
  switch (tab) {
    case 'guide':
      html = getGuideContent();
      break;
    case 'cases':
      html = getCasesContent();
      break;
    case 'knowledge':
      html = getKnowledgeContent();
      break;
    default:
      html = getGuideContent();
  }

  tabContent.innerHTML = html;
}

// ============================================================
// 8. 教学功能内容
// ============================================================

/**
 * 获取逐步引导内容
 * @returns {string} HTML内容
 */
function getGuideContent() {
  var html = '';

  html += '<div class="guide-section">';
  html += '<h3>奇门遁甲入门指南</h3>';

  html += '<div class="guide-step">';
  html += '<h4>第一步：了解基础概念</h4>';
  html += '<p>奇门遁甲是中国古代术数之一，与六壬、太乙并称"三式"。它以洛书九宫为基础，结合天干地支、九星、八门、八神等要素，用于预测和决策。</p>';
  html += '</div>';

  html += '<div class="guide-step">';
  html += '<h4>第二步：认识九宫</h4>';
  html += '<p>九宫是奇门遁甲的基础框架，对应洛书九个方位：</p>';
  html += '<ul>';
  html += '<li><strong>坎一宫（北）</strong>：属水，主智慧、险陷</li>';
  html += '<li><strong>坤二宫（西南）</strong>：属土，主顺从、承载</li>';
  html += '<li><strong>震三宫（东）</strong>：属木，主震动、奋起</li>';
  html += '<li><strong>巽四宫（东南）</strong>：属木，主进入、柔和</li>';
  html += '<li><strong>中五宫（中）</strong>：属土，主核心、统领</li>';
  html += '<li><strong>乾六宫（西北）</strong>：属金，主刚健、决断</li>';
  html += '<li><strong>兑七宫（西）</strong>：属金，主喜悦、口舌</li>';
  html += '<li><strong>艮八宫（东北）</strong>：属土，主停止、稳固</li>';
  html += '<li><strong>离九宫（南）</strong>：属火，主光明、文明</li>';
  html += '</ul>';
  html += '</div>';

  html += '<div class="guide-step">';
  html += '<h4>第三步：了解九星</h4>';
  html += '<p>九星是天盘的核心，代表天时的影响：</p>';
  html += '<ul>';
  html += '<li><strong>天蓬</strong>（水/凶）：盗贼、暗昧、凶险</li>';
  html += '<li><strong>天芮</strong>（土/凶）：疾病、阴柔、困顿</li>';
  html += '<li><strong>天冲</strong>（木/小吉）：冲动、勇猛、急进</li>';
  html += '<li><strong>天辅</strong>（木/大吉）：文雅、辅佐、教化</li>';
  html += '<li><strong>天禽</strong>（土/大吉）：中正、权威、尊贵</li>';
  html += '<li><strong>天心</strong>（金/大吉）：智慧、决断、权威</li>';
  html += '<li><strong>天柱</strong>（金/凶）：破败、口舌、惊恐</li>';
  html += '<li><strong>天任</strong>（土/吉）：厚德、承载、稳重</li>';
  html += '<li><strong>天英</strong>（火/小凶）：文明、光华、急躁</li>';
  html += '</ul>';
  html += '</div>';

  html += '<div class="guide-step">';
  html += '<h4>第四步：了解八门</h4>';
  html += '<p>八门是人盘的核心，代表人事的变化：</p>';
  html += '<ul>';
  html += '<li><strong>开门</strong>（金/大吉）：开放、通达、开始</li>';
  html += '<li><strong>休门</strong>（水/大吉）：休养、安逸、贵人</li>';
  html += '<li><strong>生门</strong>（土/大吉）：生长、财富、生机</li>';
  html += '<li><strong>伤门</strong>（木/凶）：伤害、损失、争斗</li>';
  html += '<li><strong>杜门</strong>（木/小凶）：闭塞、隐藏、不通</li>';
  html += '<li><strong>景门</strong>（火/平）：文书、考试、光明</li>';
  html += '<li><strong>死门</strong>（土/大凶）：死亡、终结、固执</li>';
  html += '<li><strong>惊门</strong>（金/凶）：惊恐、口舌、虚惊</li>';
  html += '</ul>';
  html += '</div>';

  html += '<div class="guide-step">';
  html += '<h4>第五步：了解八神</h4>';
  html += '<p>八神是神盘的核心，代表神助的影响：</p>';
  html += '<ul>';
  html += '<li><strong>值符</strong>（木/大吉）：首领、权威、贵人</li>';
  html += '<li><strong>腾蛇</strong>（火/凶）：虚惊、怪异、缠绕</li>';
  html += '<li><strong>太阴</strong>（金/大吉）：阴佑、暗助、庇护</li>';
  html += '<li><strong>六合</strong>（木/大吉）：合和、婚姻、合作</li>';
  html += '<li><strong>白虎</strong>（金/大凶）：凶险、血光、伤害</li>';
  html += '<li><strong>玄武</strong>（水/大凶）：盗窃、欺骗、暗昧</li>';
  html += '<li><strong>九地</strong>（土/吉）：柔顺、承载、安定</li>';
  html += '<li><strong>九天</strong>（金/大吉）：高远、腾飞、远行</li>';
  html += '</ul>';
  html += '</div>';

  html += '<div class="guide-step">';
  html += '<h4>第六步：开始排盘</h4>';
  html += '<p>选择一个时间，点击"排盘"按钮，系统会自动计算并显示九宫格局。点击任意宫位可查看详细的符号解读。</p>';
  html += '</div>';

  html += '</div>';

  return html;
}

/**
 * 获取案例库内容
 * @returns {string} HTML内容
 */
function getCasesContent() {
  var html = '';

  html += '<div class="cases-section">';
  html += '<h3>经典案例分析</h3>';

  html += '<div class="case-item">';
  html += '<h4>案例一：求职问事业</h4>';
  html += '<div class="case-scenario">';
  html += '<p><strong>问事：</strong>某人想换工作，问是否顺利？</p>';
  html += '<p><strong>格局：</strong>阳遁三局，值符天冲星落离九宫，开门落巽四宫</p>';
  html += '</div>';
  html += '<div class="case-analysis">';
  html += '<p><strong>分析：</strong></p>';
  html += '<ul>';
  html += '<li>天冲星属木，主动冲动、勇猛，利于主动出击求职</li>';
  html += '<li>开门落巽四宫，巽为风、为入，主事情顺利开展</li>';
  html += '<li>值符（贵人）临离九宫，离为火、为文明，主有贵人相助</li>';
  html += '</ul>';
  html += '<p><strong>结论：</strong>求职顺利，宜主动出击，会有贵人相助。</p>';
  html += '</div>';
  html += '</div>';

  html += '<div class="case-item">';
  html += '<h4>案例二：投资问财</h4>';
  html += '<div class="case-scenario">';
  html += '<p><strong>问事：</strong>某人想投资股票，问是否有利？</p>';
  html += '<p><strong>格局：</strong>阴遁六局，值符天心星落坎一宫，生门落坤二宫</p>';
  html += '</div>';
  html += '<div class="case-analysis">';
  html += '<p><strong>分析：</strong></p>';
  html += '<ul>';
  html += '<li>天心星属金，主智慧、决断，利于理性决策</li>';
  html += '<li>生门落坤二宫，坤为地、为承载，主财富稳固</li>';
  html += '<li>但坎一宫属水，金生水为泄气，主投资需谨慎</li>';
  html += '</ul>';
  html += '<p><strong>结论：</strong>投资可小试，但不宜大举投入，需谨慎决策。</p>';
  html += '</div>';
  html += '</div>';

  html += '<div class="case-item">';
  html += '<h4>案例三：感情问姻缘</h4>';
  html += '<div class="case-scenario">';
  html += '<p><strong>问事：</strong>某人问与恋人的关系发展？</p>';
  html += '<p><strong>格局：</strong>阳遁九局，值符天英星落震三宫，休门落兑七宫</p>';
  html += '</div>';
  html += '<div class="case-analysis">';
  html += '<p><strong>分析：</strong></p>';
  html += '<ul>';
  html += '<li>天英星属火，主文明、光华，感情表面光鲜</li>';
  html += '<li>休门落兑七宫，兑为泽、为口，主沟通交流</li>';
  html += '<li>但天英星小凶，主虚华不实，需防虚情假意</li>';
  html += '</ul>';
  html += '<p><strong>结论：</strong>感情表面和谐，但需深入了解对方真实想法，防虚情假意。</p>';
  html += '</div>';
  html += '</div>';

  html += '<div class="case-item">';
  html += '<h4>案例四：出行问平安</h4>';
  html += '<div class="case-scenario">';
  html += '<p><strong>问事：</strong>某人要出远门，问是否平安？</p>';
  html += '<p><strong>格局：</strong>阳遁一局，值符天蓬星落乾六宫，开门落艮八宫</p>';
  html += '</div>';
  html += '<div class="case-analysis">';
  html += '<p><strong>分析：</strong></p>';
  html += '<ul>';
  html += '<li>天蓬星属水，主盗贼、暗昧，需防盗窃</li>';
  html += '<li>开门落艮八宫，艮为山、为止，主出行受阻</li>';
  html += '<li>但乾六宫属金，金生水为相，主有贵人暗中相助</li>';
  html += '</ul>';
  html += '<p><strong>结论：</strong>出行需谨慎，防盗窃，但有贵人暗中相助，总体平安。</p>';
  html += '</div>';
  html += '</div>';

  html += '</div>';

  return html;
}

/**
 * 获取知识图谱内容
 * @returns {string} HTML内容
 */
function getKnowledgeContent() {
  var html = '';

  html += '<div class="knowledge-section">';
  html += '<h3>奇门遁甲知识图谱</h3>';

  html += '<div class="knowledge-map">';

  // 核心概念
  html += '<div class="knowledge-node core">';
  html += '<h4>奇门遁甲</h4>';
  html += '<p>中国古代三式之一，用于预测和决策</p>';
  html += '</div>';

  // 三大盘
  html += '<div class="knowledge-group">';
  html += '<h4>三大盘</h4>';
  html += '<div class="knowledge-items">';
  html += '<div class="knowledge-item">';
  html += '<h5>天盘（九星）</h5>';
  html += '<p>代表天时的影响，决定事情的大趋势</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>人盘（八门）</h5>';
  html += '<p>代表人事的变化，决定事情的具体发展</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>神盘（八神）</h5>';
  html += '<p>代表神助的影响，决定事情的顺利程度</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // 基础要素
  html += '<div class="knowledge-group">';
  html += '<h4>基础要素</h4>';
  html += '<div class="knowledge-items">';
  html += '<div class="knowledge-item">';
  html += '<h5>阴阳</h5>';
  html += '<p>冬至后到夏至前为阳遁，夏至后到冬至前为阴遁</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>五行</h5>';
  html += '<p>木、火、土、金、水，相生相克</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>天干地支</h5>';
  html += '<p>十天干、十二地支，组合成六十甲子</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // 五行关系
  html += '<div class="knowledge-group">';
  html += '<h4>五行关系</h4>';
  html += '<div class="knowledge-items">';
  html += '<div class="knowledge-item">';
  html += '<h5>相生</h5>';
  html += '<p>木生火、火生土、土生金、金生水、水生木</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>相克</h5>';
  html += '<p>木克土、土克水、水克火、火克金、金克木</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // 吉凶判断
  html += '<div class="knowledge-group">';
  html += '<h4>吉凶判断原则</h4>';
  html += '<div class="knowledge-items">';
  html += '<div class="knowledge-item">';
  html += '<h5>星门组合</h5>';
  html += '<p>吉星配吉门为大吉，凶星配凶门为大凶</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>五行生克</h5>';
  html += '<p>星门与宫位五行相生为吉，相克为凶</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>神煞影响</h5>';
  html += '<p>吉神助吉，凶神助凶</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // 排盘步骤
  html += '<div class="knowledge-group">';
  html += '<h4>排盘步骤</h4>';
  html += '<div class="knowledge-items">';
  html += '<div class="knowledge-item">';
  html += '<h5>1. 定局</h5>';
  html += '<p>根据时间确定阴阳遁和局数</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>2. 排九星</h5>';
  html += '<p>值符星随值符宫移动，其他星按洛书顺序排列</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>3. 排八门</h5>';
  html += '<p>值使门随值符宫移动，其他门按洛书顺序排列</p>';
  html += '</div>';
  html += '<div class="knowledge-item">';
  html += '<h5>4. 排八神</h5>';
  html += '<p>从值符宫开始，阳遁顺时针、阴遁逆时针排列</p>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';

  return html;
}

// ============================================================
// 应用启动
// ============================================================

/**
 * DOM 加载完成后初始化应用
 */
document.addEventListener('DOMContentLoaded', initApp);

// ============================================================
// 导出
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initApp,
    loadSymbolsData,
    setDefaultTime,
    bindEvents,
    handleCalculate,
    handleReset,
    handleTabSwitch,
    getGuideContent,
    getCasesContent,
    getKnowledgeContent
  };
} else if (typeof window !== 'undefined') {
  window.App = {
    initApp,
    loadSymbolsData,
    setDefaultTime,
    bindEvents,
    handleCalculate,
    handleReset,
    handleTabSwitch,
    getGuideContent,
    getCasesContent,
    getKnowledgeContent
  };
}
