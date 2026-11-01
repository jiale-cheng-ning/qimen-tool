const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'js/qimen.js'), 'utf8');

function calculateWithClock(systemYear, inputYear) {
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [`${systemYear}-11-01T12:00:00+08:00`]));
    }
  }
  const context = vm.createContext({ Date: FixedDate, module: { exports: {} } });
  vm.runInContext(source, context);
  const result = context.module.exports.calculateQimen(inputYear, 5, 21, 10);
  const expected = context.module.exports.getJuNumber(inputYear, 5, 21);
  assert.equal(result.juInfo.juNumber, expected.juNumber);
  return JSON.stringify(result);
}

for (const year of [1901, 2024, 2025, 2030]) {
  assert.equal(calculateWithClock(2025, year), calculateWithClock(2026, year));
}
console.log('历史排盘不受系统年份影响：通过');

const context = vm.createContext({ Date, module: { exports: {} } });
vm.runInContext(source, context);
for (const yinYang of ['阳', '阴']) {
  for (let ju = 1; ju <= 9; ju++) {
    for (const gan of context.module.exports.TIAN_GAN) {
      for (const zhi of context.module.exports.DI_ZHI) {
        const palaces = context.arrangePalace(ju, yinYang, { hourGan: gan, hourZhi: zhi });
        assert.equal(new Set(palaces.map(p => p.star).filter(Boolean)).size, 9);
        assert.equal(new Set(palaces.map(p => p.men).filter(Boolean)).size, 8);
        assert.equal(new Set(palaces.map(p => p.shen).filter(Boolean)).size, 8);
      }
    }
  }
}
console.log('2160 种九宫布局无缺项、无覆盖：通过');
