/**
 * 星空背景动画模块
 * 为奇门遁甲占卜工具添加星空背景效果
 */

/**
 * 创建星空背景
 * 生成容器元素、100个星星和流星效果
 */
function createStarryBackground() {
  // 创建星空容器
  var container = document.createElement('div');
  container.id = 'starry-background';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;overflow:hidden;';

  // 生成100个星星
  for (var i = 0; i < 100; i++) {
    var star = document.createElement('div');
    star.className = 'star';

    // 随机位置
    var x = Math.random() * 100;
    var y = Math.random() * 100;

    // 随机大小（1-3px）
    var size = Math.random() * 2 + 1;

    // 随机动画延迟
    var delay = Math.random() * 3;

    // 随机动画持续时间（2-4秒）
    var duration = Math.random() * 2 + 2;

    star.style.cssText =
      'position:absolute;' +
      'left:' + x + '%;' +
      'top:' + y + '%;' +
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      'background:rgba(255,255,255,0.8);' +
      'border-radius:50%;' +
      'animation:twinkle ' + duration + 's ease-in-out infinite ' + delay + 's;';

    container.appendChild(star);
  }

  // 添加到body
  document.body.insertBefore(container, document.body.firstChild);
}

/**
 * 创建流星
 * 随机起始位置，渐变动画，动画结束后移除
 */
function createMeteor() {
  var container = document.getElementById('starry-background');
  if (!container) return;

  var meteor = document.createElement('div');

  // 随机起始位置（右侧区域）
  var startX = Math.random() * 40 + 60; // 60%-100%
  var startY = Math.random() * 20; // 0%-20%

  // 随机大小
  var width = Math.random() * 100 + 80; // 80-180px
  var height = 2; // 固定高度2px

  // 随机动画持续时间
  var duration = Math.random() * 0.8 + 0.6; // 0.6-1.4秒

  // 随机透明度
  var opacity = Math.random() * 0.4 + 0.6; // 0.6-1.0

  meteor.style.cssText =
    'position:absolute;' +
    'left:' + startX + '%;' +
    'top:' + startY + '%;' +
    'width:' + width + 'px;' +
    'height:' + height + 'px;' +
    'background:linear-gradient(to left, rgba(255,255,255,' + opacity + '), transparent);' +
    'transform:rotate(-45deg);' +
    'animation:meteorFall ' + duration + 's linear forwards;' +
    'pointer-events:none;';

  container.appendChild(meteor);

  // 动画结束后移除
  setTimeout(function() {
    if (meteor.parentNode) {
      meteor.parentNode.removeChild(meteor);
    }
  }, duration * 1000 + 100);
}

/**
 * 添加流星动画CSS
 * 注意：meteorFall和twinkle动画已在animations.css中定义，此处不重复
 */
function addMeteorStyles() {
  // 动画已在animations.css中定义，无需重复添加
}

/**
 * 初始化星空背景
 * 添加样式并创建背景，定时生成流星
 */
function initStarryBackground() {
  addMeteorStyles();
  createStarryBackground();

  // 使用递归setTimeout实现随机间隔的流星生成
  function scheduleMeteor() {
    var delay = Math.random() * 3000 + 2000; // 2-5秒随机间隔
    setTimeout(function() {
      createMeteor();
      scheduleMeteor();
    }, delay);
  }

  scheduleMeteor();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createStarryBackground,
    createMeteor,
    addMeteorStyles,
    initStarryBackground
  };
} else if (typeof window !== 'undefined') {
  window.Starry = {
    createStarryBackground,
    createMeteor,
    addMeteorStyles,
    initStarryBackground
  };
}
