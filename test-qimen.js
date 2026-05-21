/**
 * 奇门遁甲排盘算法测试
 */

const {
  TIAN_GAN, DI_ZHI, WU_XING, JIU_XING, BA_MEN, BA_SHEN, JIU_GONG,
  LIU_SHI_JIA_ZI, GAN_WUXING,
  getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi,
  getYinYang, getJuNumber, calculateQimen
} = require('./js/qimen.js');

// 测试工具
function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    process.exitCode = 1;
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`  ✓ ${message} (实际: ${actual})`);
  } else {
    console.error(`  ✗ ${message} (期望: ${expected}, 实际: ${actual})`);
    process.exitCode = 1;
  }
}

// ============================================================
// 测试1：基础数据
// ============================================================
console.log('\n=== 测试1：基础数据 ===');

assertEqual(TIAN_GAN.length, 10, '天干数组长度为10');
assertEqual(TIAN_GAN[0], '甲', '天干第一个为甲');
assertEqual(TIAN_GAN[9], '癸', '天干最后一个为癸');

assertEqual(DI_ZHI.length, 12, '地支数组长度为12');
assertEqual(DI_ZHI[0], '子', '地支第一个为子');
assertEqual(DI_ZHI[11], '亥', '地支最后一个为亥');

assertEqual(JIU_XING.length, 9, '九星数组长度为9');
assertEqual(BA_MEN.length, 8, '八门数组长度为8');
assertEqual(BA_SHEN.length, 8, '八神数组长度为8');
assertEqual(JIU_GONG.length, 9, '九宫数组长度为9');
assertEqual(LIU_SHI_JIA_ZI.length, 60, '六十甲子数组长度为60');

assertEqual(LIU_SHI_JIA_ZI[0], '甲子', '六十甲子第一个为甲子');
assertEqual(LIU_SHI_JIA_ZI[59], '癸亥', '六十甲子最后一个为癸亥');

// ============================================================
// 测试2：年干支
// ============================================================
console.log('\n=== 测试2：年干支 ===');

const year2024 = getYearGanZhi(2024);
assertEqual(year2024.gz, '甲辰', '2024年为甲辰年');

const year2025 = getYearGanZhi(2025);
assertEqual(year2025.gz, '乙巳', '2025年为乙巳年');

const year2026 = getYearGanZhi(2026);
assertEqual(year2026.gz, '丙午', '2026年为丙午年');

// ============================================================
// 测试3：月干支
// ============================================================
console.log('\n=== 测试3：月干支 ===');

// 甲己年正月起丙寅
const month1 = getMonthGanZhi('甲', 1);
assertEqual(month1.gz, '丙寅', '甲年正月为丙寅');

const month2 = getMonthGanZhi('甲', 2);
assertEqual(month2.gz, '丁卯', '甲年二月为丁卯');

// 乙庚年正月起戊寅
const month3 = getMonthGanZhi('乙', 1);
assertEqual(month3.gz, '戊寅', '乙年正月为戊寅');

// ============================================================
// 测试4：日干支
// ============================================================
console.log('\n=== 测试4：日干支 ===');

// 1900年1月1日为甲子日（基准日）
const day19000101 = getDayGanZhi(1900, 1, 1);
assertEqual(day19000101.gz, '甲子', '1900年1月1日为甲子日');

// 2024年1月1日
const day20240101 = getDayGanZhi(2024, 1, 1);
console.log(`  2024年1月1日: ${day20240101.gz} (${day20240101.index})`);

// ============================================================
// 测试5：时干支
// ============================================================
console.log('\n=== 测试5：时干支 ===');

// 甲己日子时起甲子
const hour1 = getHourGanZhi('甲', 0);
assertEqual(hour1.gz, '甲子', '甲日子时为甲子');

const hour2 = getHourGanZhi('甲', 3);
assertEqual(hour2.gz, '丙寅', '甲日寅时(3时)为丙寅');

// 乙庚日子时起丙子
const hour3 = getHourGanZhi('乙', 0);
assertEqual(hour3.gz, '丙子', '乙日子时为丙子');

// ============================================================
// 测试6：阴阳遁判断
// ============================================================
console.log('\n=== 测试6：阴阳遁判断 ===');

assertEqual(getYinYang(1, 1), '阳', '1月为阳遁');
assertEqual(getYinYang(5, 15), '阳', '5月为阳遁');
assertEqual(getYinYang(9, 30), '阳', '9月为阳遁');
assertEqual(getYinYang(10, 1), '阴', '10月为阴遁');
assertEqual(getYinYang(12, 25), '阴', '12月为阴遁');

// ============================================================
// 测试7：完整排盘
// ============================================================
console.log('\n=== 测试7：完整排盘 ===');

// 测试2024年5月21日 10:00
const result1 = calculateQimen(2024, 5, 21, 10);
console.log(`\n  2024年5月21日 10:00 排盘结果:`);
console.log(`  年干支: ${result1.ganZhi.year.gz}`);
console.log(`  月干支: ${result1.ganZhi.month.gz}`);
console.log(`  日干支: ${result1.ganZhi.day.gz}`);
console.log(`  时干支: ${result1.ganZhi.hour.gz}`);
console.log(`  局数: ${result1.juInfo.display}`);
console.log(`  九宫排布:`);
result1.palaces.forEach(p => {
  console.log(`    ${p.name} (${p.direction}): 星=${p.star || '-'} 门=${p.men || '-'} 神=${p.shen || '-'}`);
});

// 验证排盘结果完整性
const palaces1 = result1.palaces;
assert(palaces1.length === 9, '排盘结果包含9个宫位');

// 检查九星是否全部排布
const stars = palaces1.map(p => p.star).filter(Boolean);
assertEqual(stars.length, 9, '九星全部排布');

// 检查八门是否全部排布
const gates = palaces1.map(p => p.men).filter(Boolean);
assertEqual(gates.length, 8, '八门全部排布');

// 检查八神是否全部排布
const spirits = palaces1.map(p => p.shen).filter(Boolean);
assertEqual(spirits.length, 8, '八神全部排布');

// 测试不同时辰
console.log('\n  --- 不同时辰对比 ---');
const result2 = calculateQimen(2024, 5, 21, 14);
console.log(`  2024年5月21日 14:00: ${result2.juInfo.display}`);
console.log(`  时干支: ${result2.ganZhi.hour.gz}`);

const result3 = calculateQimen(2024, 5, 21, 22);
console.log(`  2024年5月21日 22:00: ${result3.juInfo.display}`);
console.log(`  时干支: ${result3.ganZhi.hour.gz}`);

// 测试阴遁月份
console.log('\n  --- 阴遁测试 ---');
const result4 = calculateQimen(2024, 11, 15, 10);
console.log(`  2024年11月15日 10:00: ${result4.juInfo.display}`);
console.log(`  年干支: ${result4.ganZhi.year.gz}`);
console.log(`  月干支: ${result4.ganZhi.month.gz}`);
console.log(`  日干支: ${result4.ganZhi.day.gz}`);
console.log(`  时干支: ${result4.ganZhi.hour.gz}`);

// ============================================================
// 测试8：边界情况
// ============================================================
console.log('\n=== 测试8：边界情况 ===');

// 子时（23:00-01:00）
const result5 = calculateQimen(2024, 5, 21, 23);
assertEqual(result5.ganZhi.hour.zhi, '子', '23:00为子时');

const result6 = calculateQimen(2024, 5, 21, 0);
assertEqual(result6.ganZhi.hour.zhi, '子', '0:00为子时');

// 午时（11:00-13:00）
const result7 = calculateQimen(2024, 5, 21, 12);
assertEqual(result7.ganZhi.hour.zhi, '午', '12:00为午时');

// ============================================================
// 测试9：五行属性
// ============================================================
console.log('\n=== 测试9：五行属性 ===');

// GAN_WUXING is already imported at the top of the file
assertEqual(GAN_WUXING['甲'], '木', '甲属木');
assertEqual(GAN_WUXING['丙'], '火', '丙属火');
assertEqual(GAN_WUXING['戊'], '土', '戊属土');
assertEqual(GAN_WUXING['庚'], '金', '庚属金');
assertEqual(GAN_WUXING['壬'], '水', '壬属水');

// ============================================================
// 测试总结
// ============================================================
console.log('\n=== 测试完成 ===');
console.log('所有测试已运行完毕。');
console.log('注意：奇门遁甲排盘算法基于简化的洛书九宫模型，');
console.log('实际应用中需要考虑节气、置润等复杂因素。');
