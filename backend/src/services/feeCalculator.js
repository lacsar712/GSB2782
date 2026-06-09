/**
 * 停车费计算服务
 * 独立封装计费算法，供 controller 调用
 */

/**
 * 计算停车费用
 * @param {Object} params - 计费参数
 * @param {number} params.parkingMinutes - 停车总分钟数
 * @param {number} params.freeMinutes - 免费分钟数
 * @param {number} params.pricePerHour - 每小时单价
 * @param {number} params.dailyCap - 日封顶金额（0 表示不封顶）
 * @param {string} params.rounding - 取整规则 ('30min_up' | '60min_up')
 * @returns {Object} 计算结果
 */
function calculateFee({ parkingMinutes, freeMinutes, pricePerHour, dailyCap, rounding }) {
  const parkingMins = Math.max(0, parseInt(parkingMinutes) || 0);
  const freeMins = Math.max(0, parseInt(freeMinutes) || 0);
  const price = parseFloat(pricePerHour) || 0;
  const cap = parseFloat(dailyCap) || 0;

  if (parkingMins <= freeMins) {
    return {
      parking_minutes: parkingMins,
      free_minutes: freeMins,
      chargeable_minutes: 0,
      billable_hours: 0,
      fee: 0,
    };
  }

  const chargeableMinutes = parkingMins - freeMins;

  let billableHours = 0;
  if (rounding === '30min_up') {
    billableHours = Math.ceil(chargeableMinutes / 30) * 0.5;
  } else {
    billableHours = Math.ceil(chargeableMinutes / 60);
  }

  let fee = billableHours * price;

  if (cap > 0) {
    fee = Math.min(fee, cap);
  }

  fee = Math.round(fee * 100) / 100;

  return {
    parking_minutes: parkingMins,
    free_minutes: freeMins,
    chargeable_minutes: chargeableMinutes,
    billable_hours: billableHours,
    fee: fee,
  };
}

module.exports = {
  calculateFee,
};
