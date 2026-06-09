const bcrypt = require('bcryptjs');

/**
 * 密码加密
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 加密后的密码
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 密码验证
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} 是否匹配
 */
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 获取客户端IP地址
 * @param {Object} req - Express请求对象
 * @returns {string} IP地址
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * 统一响应格式
 * @param {Object} res - Express响应对象
 * @param {number} code - 状态码
 * @param {string} message - 消息
 * @param {*} data - 数据
 */
function sendResponse(res, code = 0, message = 'success', data = null) {
  const response = { code, message };
  if (data !== null) {
    response.data = data;
  }
  res.json(response);
}

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP状态码
 */
function sendError(res, message = '操作失败', statusCode = 400) {
  res.status(statusCode).json({
    code: statusCode,
    message,
  });
}

module.exports = {
  hashPassword,
  comparePassword,
  getClientIp,
  sendResponse,
  sendError,
};
