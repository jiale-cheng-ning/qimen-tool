/**
 * 奇门遁甲排盘算法
 * 基于洛书九宫的奇门遁甲自动排盘系统
 * 教学和研究用途
 */

// ============================================================
// Step 1: 基础数据定义
// ============================================================

/** 十天干 */
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 十二地支 */
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 五行 */
const WU_XING = ['木', '火', '土', '金', '水'];

/** 九星 */
const JIU_XING = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];

/** 八门 */
const BA_MEN = ['开门', '休门', '生门', '伤门', '杜门', '景门', '死门', '惊门'];

/** 八神 */
const BA_SHEN = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];

/** 九宫数据 */
const JIU_GONG = [
  { id: 1, name: '坎一宫', direction: '北', xing: '水', trigram: '坎' },
  { id: 2, name: '坤二宫', direction: '西南', xing: '土', trigram: '坤' },
  { id: 3, name: '震三宫', direction: '东', xing: '木', trigram: '震' },
  { id: 4, name: '巽四宫', direction: '东南', xing: '木', trigram: '巽' },
  { id: 5, name: '中五宫', direction: '中', xing: '土', trigram: '中' },
  { id: 6, name: '乾六宫', direction: '西北', xing: '金', trigram: '乾' },
  { id: 7, name: '兑七宫', direction: '西', xing: '金', trigram: '兑' },
  { id: 8, name: '艮八宫', direction: '东北', xing: '土', trigram: '艮' },
  { id: 9, name: '离九宫', direction: '南', xing: '火', trigram: '离' }
];

/** 地支对应的宫位 */
const DI_ZHI_GONG = {
  '子': 1, '丑': 8, '寅': 8, '卯': 3, '辰': 4, '巳': 4,
  '午': 9, '未': 2, '申': 2, '酉': 7, '戌': 6, '亥': 6
};

/** 八门对应原宫位 */
const MEN_GONG = {
  '开门': 6, '休门': 1, '生门': 8, '伤门': 3,
  '杜门': 4, '景门': 9, '死门': 2, '惊门': 7
};

/** 八神五行属性 */
const SHEN_WUXING = {
  '值符': '木', '腾蛇': '火', '太阴': '金', '六合': '木',
  '白虎': '金', '玄武': '水', '九地': '土', '九天': '金'
};

/** 天干五行属性 */
const GAN_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

/** 生成六十甲子 */
const LIU_SHI_JIA_ZI = [];
for (let i = 0; i < 60; i++) {
  LIU_SHI_JIA_ZI.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
}

/** 洛书序列（不含中宫5）- 顺时针方向：坎1→坤2→震3→巽4→离9→兑7→乾6→艮8 */
const LUOSHU_SEQUENCE = [1, 8, 3, 4, 9, 2, 7, 6];

/**
 * 洛书顺时针推进（跳过中宫5）
 * @param {number} startPalace - 起始宫位（1-9）
 * @param {number} steps - 步数
 * @returns {number} 目标宫位
 */
function luoshuAdvance(startPalace, steps) {
  let idx = LUOSHU_SEQUENCE.indexOf(startPalace);
  if (idx === -1) idx = LUOSHU_SEQUENCE.indexOf(6); // 中5宫映射到乾6
  const newIdx = (idx + steps) % 8;
  return LUOSHU_SEQUENCE[newIdx];
}

/**
 * 洛书逆时针推进（跳过中宫5）
 * @param {number} startPalace - 起始宫位（1-9）
 * @param {number} steps - 步数
 * @returns {number} 目标宫位
 */
function luoshuReverse(startPalace, steps) {
  let idx = LUOSHU_SEQUENCE.indexOf(startPalace);
  if (idx === -1) idx = LUOSHU_SEQUENCE.indexOf(6); // 中5宫映射到乾6
  const newIdx = (idx - steps + 8) % 8;
  return LUOSHU_SEQUENCE[newIdx];
}

// ============================================================
// Step 2: 干支计算函数
// ============================================================

/**
 * 计算年干支
 * @param {number} year - 公历年
 * @returns {{ gan: string, zhi: string, gz: string, index: number }}
 */
function getYearGanZhi(year) {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
    gz: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
    index: (year - 4) % 60
  };
}

/**
 * 计算月干支
 * @param {string} yearGan - 年干
 * @param {number} month - 月（1-12）
 * @returns {{ gan: string, zhi: string, gz: string, index: number }}
 */
function getMonthGanZhi(yearGan, month) {
  // 五虎遁月：年干决定月干起始
  const offsets = { '甲': 2, '乙': 4, '丙': 6, '丁': 8, '戊': 0, '己': 2, '庚': 4, '辛': 6, '壬': 8, '癸': 0 };
  const monthGanIndex = (offsets[yearGan] + month - 1) % 10;
  // 月支：正月寅、二月卯……
  const monthZhiIndex = (month + 1) % 12;
  return {
    gan: TIAN_GAN[monthGanIndex],
    zhi: DI_ZHI[monthZhiIndex],
    gz: TIAN_GAN[monthGanIndex] + DI_ZHI[monthZhiIndex],
    index: (monthGanIndex * 12 + monthZhiIndex) % 60
  };
}

/**
 * 计算日干支
 * @param {number} year - 公历年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日
 * @returns {{ gan: string, zhi: string, gz: string, index: number }}
 */
function getDayGanZhi(year, month, day) {
  // 基准日：1900年1月1日为甲子日
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate - baseDate) / 86400000);
  const index = ((daysDiff % 60) + 60) % 60;
  return {
    gan: TIAN_GAN[index % 10],
    zhi: DI_ZHI[index % 12],
    gz: LIU_SHI_JIA_ZI[index],
    index: index
  };
}

/**
 * 计算时干支
 * @param {string} dayGan - 日干
 * @param {number} hour - 时（0-23）
 * @returns {{ gan: string, zhi: string, gz: string, index: number }}
 */
function getHourGanZhi(dayGan, hour) {
  // 时支：23-1子、1-3丑、3-5寅……
  const hourZhiIndex = Math.floor(((hour + 1) % 24) / 2);
  // 五鼠遁时：日干决定时干起始
  const dayGanOffsets = { '甲': 0, '乙': 2, '丙': 4, '丁': 6, '戊': 8, '己': 0, '庚': 2, '辛': 4, '壬': 6, '癸': 8 };
  const hourGanIndex = (dayGanOffsets[dayGan] + hourZhiIndex) % 10;
  return {
    gan: TIAN_GAN[hourGanIndex],
    zhi: DI_ZHI[hourZhiIndex],
    gz: TIAN_GAN[hourGanIndex] + DI_ZHI[hourZhiIndex],
    index: hourGanIndex * 12 + hourZhiIndex
  };
}

// ============================================================
// Step 3: 局数计算
// ============================================================

/**
 * 判断阴阳遁
 * @param {number} month - 月（1-12）
 * @returns {string} '阳' 或 '阴'
 */
function getYinYang(month) {
  // 简化判断：冬至后到夏至前为阳遁，夏至后到冬至前为阴遁
  // 这里简化用月份：1-9月阳遁，10-12月阴遁
  return (month >= 1 && month <= 9) ? '阳' : '阴';
}

/**
 * 计算局数
 * @param {string} yearGan - 年干
 * @param {number} month - 月
 * @param {number} day - 日
 * @returns {{ juNumber: number, yinYang: string }}
 */
function getJuNumber(yearGan, month, day) {
  const yinYang = getYinYang(month);
  const dayInfo = getDayGanZhi(new Date().getFullYear(), month, day);

  // 日干对应宫数（1-10，甲1→癸10）
  const ganPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const ganPos = ganPositions[TIAN_GAN.indexOf(dayInfo.gan)];

  // 日支位置用于判断三元
  const zhiPos = DI_ZHI.indexOf(dayInfo.zhi); // 0-11
  const zhiMod = (zhiPos + 1) % 9;

  // 三元判断
  let yuanOffset = 0;
  if (zhiMod === 0) yuanOffset = 0;       // 上元
  else if (zhiMod <= 2) yuanOffset = 3;    // 中元
  else yuanOffset = 6;                      // 下元

  // 局数 = 宫数 + 三元偏移（取模9，0→9）
  let juNumber = (ganPos + yuanOffset) % 9;
  if (juNumber === 0) juNumber = 9;

  return { juNumber, yinYang };
}

// ============================================================
// Step 4: 九宫排盘
// ============================================================

/**
 * 排布九宫格局
 * @param {number} juNumber - 局数（1-9）
 * @param {string} yinYang - '阳' 或 '阴'
 * @param {object} timeInfo - { hourGan, hourZhi }
 * @returns {Array} 九宫排盘结果
 */
function arrangePalace(juNumber, yinYang, timeInfo) {
  const { hourGan, hourZhi } = timeInfo;
  const hourGanIdx = TIAN_GAN.indexOf(hourGan); // 0-9

  // 初始化九宫
  const palaces = [];
  for (let i = 1; i <= 9; i++) {
    palaces.push({
      id: i,
      name: JIU_GONG[i - 1].name,
      direction: JIU_GONG[i - 1].direction,
      xing: JIU_GONG[i - 1].xing,
      trigram: JIU_GONG[i - 1].trigram,
      star: null,
      men: null,
      shen: null
    });
  }

  // ---- 九星原始宫位 ----
  // 天蓬→坎1 天芮→坤2 天冲→震3 天辅→巽4 天禽→中5 天心→乾6 天柱→兑7 天任→艮8 天英→离9
  // 值符星序号 = 局数 - 1（九星数组索引）

  // 计算值符（局数对应星）移到哪个宫
  let zhiFuTargetPalace;
  if (yinYang === '阳') {
    // 阳遁：时干对应宫位（甲1→癸9→甲1循环，跳过中5→用6替代）
    zhiFuTargetPalace = (hourGanIdx % 9) + 1;
    if (zhiFuTargetPalace === 5) zhiFuTargetPalace = 6;
  } else {
    // 阴遁：从离9宫逆推
    if (hourGanIdx === 0) {
      zhiFuTargetPalace = juNumber === 5 ? 6 : juNumber;
    } else {
      zhiFuTargetPalace = luoshuReverse(9, hourGanIdx - 1);
      if (zhiFuTargetPalace === 5) zhiFuTargetPalace = luoshuReverse(6, 0);
    }
  }

  // 排九星
  const zhiFuStarIdx = juNumber - 1; // 值符星在九星数组中的索引
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      // 天禽永远在中5宫
      palaces[4].star = JIU_XING[4];
      continue;
    }
    const offset = (i - zhiFuStarIdx + 9) % 9;
    const targetPalace = (offset === 0) ? zhiFuTargetPalace
      : (yinYang === '阳' ? luoshuAdvance(zhiFuTargetPalace, offset) : luoshuReverse(zhiFuTargetPalace, offset));
    palaces[targetPalace - 1].star = JIU_XING[i];
  }

  // ---- 排八门 ----
  // 八门原始宫位（按洛书序列排列）：休门坎1、生门艮8、伤门震3、杜门巽4、景门离9、死门坤2、惊门兑7、开门乾6
  const gateLuoshuOriginal = [1, 8, 3, 4, 9, 2, 7, 6]; // 八门在洛书序列中的原始宫位
  const gateNames = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']; // 对应洛书序列的门名

  // 九星与八门对应关系
  // 天蓬→休门 天芮→死门 天冲→伤门 天辅→杜门 天禽→(中宫无门) 天心→开门 天柱→惊门 天任→生门 天英→景门
  const xingToMen = { 0: 0, 1: 5, 2: 2, 3: 3, 4: -1, 5: 7, 6: 6, 7: 1, 8: 4 }; // 九星索引→洛书门名索引

  let gateOffset = 0; // 八门整体偏移步数

  if (juNumber === 5) {
    // 中5局特殊处理：天禽为值符，无对应门
    // 使用时支对应的宫位作为门的参考宫
    const hourZhiPalace = DI_ZHI_GONG[hourZhi]; // 时支对应宫位
    const baseZhiIdx = DI_ZHI.indexOf('寅'); // 局数1对应寅，作为基准地支
    const hourZhiIdx = DI_ZHI.indexOf(hourZhi);
    gateOffset = (hourZhiIdx - baseZhiIdx + 12) % 12;

    // 排八门：按洛书序列旋转
    for (let i = 0; i < 8; i++) {
      const originalPalace = gateLuoshuOriginal[i];
      const originalPalaceIdx = LUOSHU_SEQUENCE.indexOf(originalPalace);
      let targetPalaceIdx;
      if (yinYang === '阳') {
        targetPalaceIdx = (originalPalaceIdx + gateOffset) % 8;
      } else {
        targetPalaceIdx = (originalPalaceIdx - gateOffset + 8) % 8;
      }
      const targetPalace = LUOSHU_SEQUENCE[targetPalaceIdx];
      palaces[targetPalace - 1].men = gateNames[i];
    }
  } else {
    // 非中5局：值使门随值符移动
    const zhiShiMenLuoshuIdx = xingToMen[zhiFuStarIdx]; // 值使门在洛书序列中的索引
    const zhiShiMenOriginalPalace = gateLuoshuOriginal[zhiShiMenLuoshuIdx]; // 值使门原始宫位

    // 计算值使门目标宫位
    // 值使门跟随值符的移动步数，但按洛书序列（而非简单的+1）推进
    // 值符从局数对应的原始宫位移到了zhiFuTargetPalace
    // 计算移动步数（在洛书序列中）
    const zhiFuOriginalPalace = juNumber === 5 ? 6 : juNumber;
    const startIdx = LUOSHU_SEQUENCE.indexOf(zhiFuOriginalPalace === 5 ? 6 : zhiFuOriginalPalace);
    const endIdx = LUOSHU_SEQUENCE.indexOf(zhiFuTargetPalace === 5 ? 6 : zhiFuTargetPalace);
    if (yinYang === '阳') {
      gateOffset = (endIdx - startIdx + 8) % 8;
    } else {
      gateOffset = (startIdx - endIdx + 8) % 8;
    }

    // 排八门
    for (let i = 0; i < 8; i++) {
      const originalPalace = gateLuoshuOriginal[i];
      const originalPalaceIdx = LUOSHU_SEQUENCE.indexOf(originalPalace);
      let targetPalaceIdx;
      if (yinYang === '阳') {
        targetPalaceIdx = (originalPalaceIdx + gateOffset) % 8;
      } else {
        targetPalaceIdx = (originalPalaceIdx - gateOffset + 8) % 8;
      }
      const targetPalace = LUOSHU_SEQUENCE[targetPalaceIdx];
      palaces[targetPalace - 1].men = gateNames[i];
    }
  }

  // ---- 排八神 ----
  // 八神从值符宫开始，阳遁顺时针、阴遁逆时针
  let zhiShenStartPalace;
  if (yinYang === '阳') {
    zhiShenStartPalace = (hourGanIdx % 9) + 1;
    if (zhiShenStartPalace === 5) zhiShenStartPalace = 6;
  } else {
    if (hourGanIdx === 0) {
      zhiShenStartPalace = juNumber === 5 ? 6 : juNumber;
    } else {
      zhiShenStartPalace = luoshuReverse(9, hourGanIdx - 1);
      if (zhiShenStartPalace === 5) zhiShenStartPalace = luoshuReverse(6, 0);
    }
  }

  for (let i = 0; i < 8; i++) {
    const targetPalace = (yinYang === '阳')
      ? luoshuAdvance(zhiShenStartPalace, i)
      : luoshuReverse(zhiShenStartPalace, i);
    palaces[targetPalace - 1].shen = BA_SHEN[i];
  }

  return palaces;
}

// ============================================================
// Step 5: 主排盘函数
// ============================================================

/**
 * 奇门遁甲排盘主函数
 * @param {number} year - 公历年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日
 * @param {number} hour - 时（0-23）
 * @returns {object} 完整排盘结果
 */
function calculateQimen(year, month, day, hour) {
  // 计算四柱干支
  const yearGZ = getYearGanZhi(year);
  const monthGZ = getMonthGanZhi(yearGZ.gan, month);
  const dayGZ = getDayGanZhi(year, month, day);
  const hourGZ = getHourGanZhi(dayGZ.gan, hour);

  // 计算局数
  const { juNumber, yinYang } = getJuNumber(yearGZ.gan, month, day);

  // 排盘
  const palaces = arrangePalace(juNumber, yinYang, {
    hourGan: hourGZ.gan,
    hourZhi: hourGZ.zhi
  });

  return {
    input: { year, month, day, hour },
    ganZhi: {
      year: yearGZ,
      month: monthGZ,
      day: dayGZ,
      hour: hourGZ
    },
    juInfo: {
      yinYang: yinYang,
      juNumber: juNumber,
      display: `${yinYang}遁${juNumber}局`
    },
    palaces: palaces
  };
}

// ============================================================
// 导出
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TIAN_GAN, DI_ZHI, WU_XING, JIU_XING, BA_MEN, BA_SHEN, JIU_GONG,
    LIU_SHI_JIA_ZI, LUOSHU_SEQUENCE, GAN_WUXING, SHEN_WUXING, DI_ZHI_GONG, MEN_GONG,
    getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi,
    getYinYang, getJuNumber, arrangePalace, calculateQimen
  };
} else if (typeof window !== 'undefined') {
  window.Qimen = {
    TIAN_GAN, DI_ZHI, WU_XING, JIU_XING, BA_MEN, BA_SHEN, JIU_GONG,
    LIU_SHI_JIA_ZI, LUOSHU_SEQUENCE, GAN_WUXING, SHEN_WUXING, DI_ZHI_GONG, MEN_GONG,
    getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi,
    getYinYang, getJuNumber, arrangePalace, calculateQimen
  };
}
