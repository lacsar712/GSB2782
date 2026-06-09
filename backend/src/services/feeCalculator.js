/**
 * 停车计费服务
 * 独立封装计费算法，由 controller 调用
 */

/**
 * 根据收费规则与停车分钟数计算应收费用
 * 当停车时长不超过免费分钟数时，结果必须为 0
 *
 * @param {Object} rule - 收费规则
 * @param {number} rule.free_minutes - 免费分钟数
 * @param {number} rule.price_per_hour - 每小时单价
 * @param {number} rule.daily_cap - 日封顶金额（0 表示不封顶）
 * @param {string} rule.rounding - 取整规则: '30min_up' | '60min_up'
 * @param {number} minutes - 停车分钟数
 * @returns {number} 应收费用（保留 2 位小数）
 */
function calculateFee(rule, minutes) {
  const freeMinutes = Number(rule.free_minutes) || 0;
  const pricePerHour = Number(rule.price_per_hour) || 0;
  const dailyCap = Number(rule.daily_cap) || 0;
  const rounding = rule.rounding || '60min_up';
  const totalMinutes = Number(minutes) || 0;

  // 不超过免费分钟数，返回 0
  if (totalMinutes <= freeMinutes) {
    return 0;
  }

  const chargeableMinutes = totalMinutes - freeMinutes;

  let hours = 0;
  if (rounding === '30min_up') {
    // 30 分钟进位
    hours = Math.ceil(chargeableMinutes / 30) * 0.5;
  } else {
    // 60 分钟进位
    hours = Math.ceil(chargeableMinutes / 60);
  }

  let fee = hours * pricePerHour;

  // 日封顶
  if (dailyCap > 0) {
    fee = Math.min(fee, dailyCap);
  }

  return Number(fee.toFixed(2));
}

module.exports = {
  calculateFee,
};
