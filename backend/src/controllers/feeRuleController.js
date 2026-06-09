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

async function calculateFeePreview(req, res) {
  try {
    const { total_minutes, free_minutes, price_per_hour, daily_cap, rounding } = req.body;

    if (total_minutes === undefined || total_minutes < 0) {
      return sendError(res, '停车分钟数无效', 400);
    }

    const rule = {
      free_minutes: free_minutes !== undefined ? Number(free_minutes) : 15,
      price_per_hour: price_per_hour !== undefined ? Number(price_per_hour) : 5.0,
      daily_cap: daily_cap !== undefined ? Number(daily_cap) : 50.0,
      rounding: rounding || '60min_up',
    };

    const fee = calculateFee(Number(total_minutes), rule);

    const chargeableMinutes = Math.max(0, Number(total_minutes) - rule.free_minutes);

    sendResponse(res, 0, 'success', {
      total_minutes: Number(total_minutes),
      free_minutes: rule.free_minutes,
      chargeable_minutes: chargeableMinutes,
      fee,
    });
  } catch (error) {
    console.error('试算错误:', error);
    sendError(res, '试算失败', 500);
  }
}

module.exports = {
  getFeeRule,
  updateFeeRule,
  calculateFeePreview,
};
