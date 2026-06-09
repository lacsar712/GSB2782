const db = require('../config/database');
const { hashPassword, sendResponse, sendError, getClientIp } = require('../utils/helpers');

/**
 * 获取用户列表
 * GET /api/users
 */
async function getUsers(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询总数
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    // 查询列表（不返回密码）
    const [users] = await db.query(
      `SELECT id, username, status, remark, last_login_at, created_at, updated_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    sendResponse(res, 0, 'success', {
      list: users,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

/**
 * 创建用户
 * POST /api/users
 */
async function createUser(req, res) {
  try {
    const { username, password, status, remark } = req.body;

    if (!username || !password) {
      return sendError(res, '用户名和密码不能为空', 400);
    }

    // 检查用户名是否已存在
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return sendError(res, '用户名已存在', 400);
    }

    // 加密密码
    const password_hash = await hashPassword(password);

    // 插入数据
    await db.query(
      `INSERT INTO users (username, password_hash, status, remark)
       VALUES (?, ?, ?, ?)`,
      [username, password_hash, status || 'enabled', remark || null]
    );

    // 记录操作日志
    const operatorUsername = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [operatorUsername, clientIp, 'CREATE_USER', JSON.stringify({ username })]
    );

    sendResponse(res, 0, '创建成功');
  } catch (error) {
    console.error('创建用户错误:', error);
    sendError(res, '创建失败', 500);
  }
}

/**
 * 更新用户
 * PUT /api/users/:id
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { status, remark, password } = req.body;

    // 检查用户是否存在
    const [existing] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, '用户不存在', 404);
    }

    // 构建更新语句
    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (remark !== undefined) {
      updates.push('remark = ?');
      params.push(remark);
    }

    if (password) {
      const password_hash = await hashPassword(password);
      updates.push('password_hash = ?');
      params.push(password_hash);
    }

    if (updates.length === 0) {
      return sendError(res, '没有需要更新的字段', 400);
    }

    params.push(id);

    // 更新数据
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    // 记录操作日志
    const operatorUsername = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [operatorUsername, clientIp, 'UPDATE_USER', JSON.stringify({ id, username: existing[0].username, ...req.body })]
    );

    sendResponse(res, 0, '更新成功');
  } catch (error) {
    console.error('更新用户错误:', error);
    sendError(res, '更新失败', 500);
  }
}

/**
 * 删除用户
 * DELETE /api/users/:id
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // 检查用户是否存在
    const [existing] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, '用户不存在', 404);
    }

    // 不允许删除自己
    if (parseInt(id) === req.user.id) {
      return sendError(res, '不能删除当前登录用户', 400);
    }

    // 删除用户（或者改为禁用）
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    // 记录操作日志
    const operatorUsername = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [operatorUsername, clientIp, 'DELETE_USER', JSON.stringify({ id, username: existing[0].username })]
    );

    sendResponse(res, 0, '删除成功');
  } catch (error) {
    console.error('删除用户错误:', error);
    sendError(res, '删除失败', 500);
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
