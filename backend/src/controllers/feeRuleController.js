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
 * 试算费用
 * POST /api/fee-rule/estimate
 * body: { minutes, free_minutes?, price_per_hour?, daily_cap?, rounding? }
 * 若未传规则字段，则使用数据库中已保存的规则
 */
async function estimateFee(req, res) {
  try {
    const { minutes } = req.body;

    if (minutes === undefined || minutes === null || isNaN(Number(minutes))) {
      return sendError(res, '请输入停车分钟数', 400);
    }

    const parsedMinutes = Number(minutes);
    if (parsedMinutes < 0) {
      return sendError(res, '停车分钟数不能为负数', 400);
    }

    let rule = {
      free_minutes: req.body.free_minutes,
      price_per_hour: req.body.price_per_hour,
      daily_cap: req.body.daily_cap,
      rounding: req.body.rounding,
    };

    // 若任意规则字段缺失，则从数据库读取最新规则补全
    const needLoad =
      rule.free_minutes === undefined ||
      rule.price_per_hour === undefined ||
      rule.daily_cap === undefined ||
      !rule.rounding;

    if (needLoad) {
      const [rules] = await db.query(
        'SELECT * FROM fee_rules ORDER BY id DESC LIMIT 1'
      );
      const dbRule =
        rules.length > 0
          ? {
              free_minutes: rules[0].free_minutes,
              price_per_hour: parseFloat(rules[0].price_per_hour),
              daily_cap: parseFloat(rules[0].daily_cap),
              rounding: rules[0].rounding,
            }
          : {
              free_minutes: 15,
              price_per_hour: 5.0,
              daily_cap: 50.0,
              rounding: '60min_up',
            };

      rule = {
        free_minutes:
          rule.free_minutes !== undefined ? rule.free_minutes : dbRule.free_minutes,
        price_per_hour:
          rule.price_per_hour !== undefined ? rule.price_per_hour : dbRule.price_per_hour,
        daily_cap: rule.daily_cap !== undefined ? rule.daily_cap : dbRule.daily_cap,
        rounding: rule.rounding || dbRule.rounding,
      };
    }

    const fee = calculateFee(rule, parsedMinutes);

    sendResponse(res, 0, 'success', {
      minutes: parsedMinutes,
      fee,
      rule,
    });
  } catch (error) {
    console.error('试算费用错误:', error);
    sendError(res, '试算失败', 500);
  }
}

module.exports = {
  getFeeRule,
  updateFeeRule,
  estimateFee,
};
