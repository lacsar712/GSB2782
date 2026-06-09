const db = require('../config/database');
const { sendResponse, sendError, getClientIp } = require('../utils/helpers');
const { calculateFee } = require('../services/feeCalculator');

/**
 * 获取收费规则
 * GET /api/fee-rule
 */
async function getFeeRule(req, res) {
  try {
    const [rules] = await db.query('SELECT * FROM fee_rules ORDER BY id DESC LIMIT 1');

    if (rules.length === 0) {
      // 返回默认规则
      return sendResponse(res, 0, 'success', {
        free_minutes: 15,
        price_per_hour: 5.0,
        daily_cap: 50.0,
        rounding: '60min_up',
      });
    }

    const rule = rules[0];
    sendResponse(res, 0, 'success', {
      free_minutes: rule.free_minutes,
      price_per_hour: parseFloat(rule.price_per_hour),
      daily_cap: parseFloat(rule.daily_cap),
      rounding: rule.rounding,
    });
  } catch (error) {
    console.error('获取收费规则错误:', error);
    sendError(res, '获取收费规则失败', 500);
  }
}

/**
 * 更新收费规则
 * POST /api/fee-rule
 */
async function updateFeeRule(req, res) {
  try {
    const { free_minutes, price_per_hour, daily_cap, rounding } = req.body;

    // 验证参数
    if (
      free_minutes === undefined ||
      price_per_hour === undefined ||
      daily_cap === undefined ||
      !rounding
    ) {
      return sendError(res, '参数不完整', 400);
    }

    // 更新或插入收费规则（只保留一条记录）
    await db.query(
      `INSERT INTO fee_rules (id, free_minutes, price_per_hour, daily_cap, rounding)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         free_minutes = VALUES(free_minutes),
         price_per_hour = VALUES(price_per_hour),
         daily_cap = VALUES(daily_cap),
         rounding = VALUES(rounding)`,
      [free_minutes, price_per_hour, daily_cap, rounding]
    );

    // 记录操作日志
    const username = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [username, clientIp, 'UPDATE_FEE_RULE', JSON.stringify(req.body)]
    );

    sendResponse(res, 0, '保存成功');
  } catch (error) {
    console.error('更新收费规则错误:', error);
    sendError(res, '保存失败', 500);
  }
}

/**
 * 试算停车费用
 * POST /api/fee-rule/calculate
 */
async function calculateParkingFee(req, res) {
  try {
    const { free_minutes, price_per_hour, daily_cap, rounding, parking_minutes } = req.body;

    if (
      free_minutes === undefined ||
      price_per_hour === undefined ||
      daily_cap === undefined ||
      !rounding ||
      parking_minutes === undefined
    ) {
      return sendError(res, '参数不完整', 400);
    }

    const rule = {
      free_minutes: parseInt(free_minutes) || 0,
      price_per_hour: parseFloat(price_per_hour) || 0,
      daily_cap: parseFloat(daily_cap) || 0,
      rounding: rounding
    };

    const parkingMinutes = parseInt(parking_minutes) || 0;
    const result = calculateFee(rule, parkingMinutes);

    sendResponse(res, 0, 'success', result);
  } catch (error) {
    console.error('试算停车费用错误:', error);
    sendError(res, '试算失败', 500);
  }
}

module.exports = {
  getFeeRule,
  updateFeeRule,
  calculateParkingFee,
};
