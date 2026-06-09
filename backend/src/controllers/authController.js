const db = require('../config/database');
const { hashPassword, comparePassword, getClientIp, sendResponse, sendError } = require('../utils/helpers');
const { generateToken } = require('../middleware/auth');

/**
 * 用户登录
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, '用户名和密码不能为空', 400);
    }

    // 查询用户
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';

    // 用户不存在
    if (users.length === 0) {
      // 记录登录失败日志
      await db.query(
        'INSERT INTO login_logs (username, ip, success, user_agent) VALUES (?, ?, 0, ?)',
        [username, clientIp, userAgent]
      );
      return sendError(res, '用户名或密码错误', 401);
    }

    const user = users[0];

    // 检查用户状态
    if (user.status !== 'enabled') {
      await db.query(
        'INSERT INTO login_logs (username, ip, success, user_agent) VALUES (?, ?, 0, ?)',
        [username, clientIp, userAgent]
      );
      return sendError(res, '账号已被禁用', 403);
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      // 记录登录失败日志
      await db.query(
        'INSERT INTO login_logs (username, ip, success, user_agent) VALUES (?, ?, 0, ?)',
        [username, clientIp, userAgent]
      );
      return sendError(res, '用户名或密码错误', 401);
    }

    // 更新最近登录时间
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // 记录登录成功日志
    await db.query(
      'INSERT INTO login_logs (username, ip, success, user_agent) VALUES (?, ?, 1, ?)',
      [username, clientIp, userAgent]
    );

    // 生成token
    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    sendResponse(res, 0, '登录成功', {
      token,
      user: {
        id: user.id,
        username: user.username,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    sendError(res, '登录失败', 500);
  }
}

/**
 * 用户登出
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    // JWT是无状态的，前端删除token即可
    // 这里可以记录登出日志（可选）
    sendResponse(res, 0, '登出成功');
  } catch (error) {
    console.error('登出错误:', error);
    sendError(res, '登出失败', 500);
  }
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      'SELECT id, username, status, remark, last_login_at, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return sendError(res, '用户不存在', 404);
    }

    sendResponse(res, 0, 'success', users[0]);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    sendError(res, '获取用户信息失败', 500);
  }
}

module.exports = {
  login,
  logout,
  getCurrentUser,
};
