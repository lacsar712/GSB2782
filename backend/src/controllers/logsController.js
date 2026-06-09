const db = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');

/**
 * 获取登录日志
 * GET /api/logs/login
 */
async function getLoginLogs(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询总数
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM login_logs');
    const total = countResult[0].total;

    // 查询列表
    const [logs] = await db.query(
      'SELECT * FROM login_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    sendResponse(res, 0, 'success', {
      list: logs,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('获取登录日志错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

/**
 * 获取操作日志
 * GET /api/logs/ops
 */
async function getOpLogs(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询总数
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM op_logs');
    const total = countResult[0].total;

    // 查询列表
    const [logs] = await db.query(
      'SELECT * FROM op_logs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    sendResponse(res, 0, 'success', {
      list: logs,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('获取操作日志错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

module.exports = {
  getLoginLogs,
  getOpLogs,
};
