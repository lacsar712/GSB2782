/**
 * 停车费用计算服务
 * 封装所有计费算法，供 controller 调用
 */

/**
 * 计算停车费用
 * @param {Object} rule - 收费规则对象
 * @param {number} rule.free_minutes - 免费分钟数
 * @param {number} rule.price_per_hour - 每小时单价
 * @param {number} rule.daily_cap - 日封顶金额
 * @param {string} rule.rounding - 取整规则 30min_up | 60min_up
 * @param {number} parkingMinutes - 停车分钟数
 * @returns {Object} 计费结果
 */
function calculateFee(rule, parkingMinutes) {
  const { free_minutes, price_per_hour, daily_cap, rounding } = rule;

  if (!parkingMinutes || parkingMinutes <= 0) {
    return {
      totalMinutes: 0,
      chargeableMinutes: 0,
      fee: 0,
      roundedHours: 0,
      isFree: true
    };
  }

  const chargeableMinutes = Math.max(0, parkingMinutes - free_minutes);

  if (chargeableMinutes <= 0) {
    return {
      totalMinutes: parkingMinutes,
      chargeableMinutes: 0,
      fee: 0,
      roundedHours: 0,
      isFree: true
    };
  }

  let roundedHours = 0;
  if (rounding === '30min_up') {
    roundedHours = Math.ceil(chargeableMinutes / 30) * 0.5;
  } else {
    roundedHours = Math.ceil(chargeableMinutes / 60);
  }

  let fee = roundedHours * price_per_hour;

  if (daily_cap > 0) {
    fee = Math.min(fee, daily_cap);
  }

  fee = Math.round(fee * 100) / 100;

  return {
    totalMinutes: parkingMinutes,
    chargeableMinutes,
    fee,
    roundedHours,
    isFree: false
  };
}

module.exports = {
  calculateFee
};
