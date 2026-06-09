function calculateFee(totalMinutes, rule) {
  const { free_minutes, price_per_hour, daily_cap, rounding } = rule;

  const chargeableMinutes = Math.max(0, totalMinutes - free_minutes);

  if (chargeableMinutes === 0) return 0;

  let hours = 0;
  if (rounding === '30min_up') {
    hours = Math.ceil(chargeableMinutes / 30) * 0.5;
  } else {
    hours = Math.ceil(chargeableMinutes / 60);
  }

  let fee = hours * price_per_hour;

  if (daily_cap > 0) {
    fee = Math.min(fee, daily_cap);
  }

  return Math.round(fee * 100) / 100;
}

module.exports = { calculateFee };
