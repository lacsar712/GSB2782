const db = require('../config/database');
const { sendResponse, sendError, getClientIp } = require('../utils/helpers');

/**
 * 获取会员车辆列表
 * GET /api/member-vehicles
 */
async function getMemberVehicles(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 查询总数
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM member_vehicles');
    const total = countResult[0].total;

    // 查询列表
    const [members] = await db.query(
      'SELECT * FROM member_vehicles ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    sendResponse(res, 0, 'success', {
      list: members,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('获取会员车辆列表错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

/**
 * 创建会员车辆
 * POST /api/member-vehicles
 */
async function createMemberVehicle(req, res) {
  try {
    const { plate_no, member_type, expire_at, status, remark } = req.body;

    if (!plate_no || !member_type || !expire_at) {
      return sendError(res, '车牌号、会员类型和有效期不能为空', 400);
    }

    // 检查车牌号是否已存在
    const [existing] = await db.query('SELECT id FROM member_vehicles WHERE plate_no = ?', [plate_no]);
    if (existing.length > 0) {
      return sendError(res, '该车牌号已存在', 400);
    }

    // 插入数据
    await db.query(
      `INSERT INTO member_vehicles (plate_no, member_type, expire_at, status, remark)
       VALUES (?, ?, ?, ?, ?)`,
      [plate_no, member_type, expire_at, status || 'enabled', remark || null]
    );

    // 记录操作日志
    const username = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [username, clientIp, 'CREATE_MEMBER', JSON.stringify({ plate_no, member_type })]
    );

    sendResponse(res, 0, '创建成功');
  } catch (error) {
    console.error('创建会员车辆错误:', error);
    sendError(res, '创建失败', 500);
  }
}

/**
 * 更新会员车辆
 * PUT /api/member-vehicles/:id
 */
async function updateMemberVehicle(req, res) {
  try {
    const { id } = req.params;
    const { member_type, expire_at, status, remark } = req.body;

    // 检查记录是否存在
    const [existing] = await db.query('SELECT id FROM member_vehicles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, '记录不存在', 404);
    }

    // 更新数据
    await db.query(
      `UPDATE member_vehicles
       SET member_type = ?, expire_at = ?, status = ?, remark = ?
       WHERE id = ?`,
      [member_type, expire_at, status, remark, id]
    );

    // 记录操作日志
    const username = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [username, clientIp, 'UPDATE_MEMBER', JSON.stringify({ id, ...req.body })]
    );

    sendResponse(res, 0, '更新成功');
  } catch (error) {
    console.error('更新会员车辆错误:', error);
    sendError(res, '更新失败', 500);
  }
}

/**
 * 删除会员车辆
 * DELETE /api/member-vehicles/:id
 */
async function deleteMemberVehicle(req, res) {
  try {
    const { id } = req.params;

    // 检查记录是否存在
    const [existing] = await db.query('SELECT plate_no FROM member_vehicles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return sendError(res, '记录不存在', 404);
    }

    // 删除数据
    await db.query('DELETE FROM member_vehicles WHERE id = ?', [id]);

    // 记录操作日志
    const username = req.user.username;
    const clientIp = getClientIp(req);
    await db.query(
      'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
      [username, clientIp, 'DELETE_MEMBER', JSON.stringify({ id, plate_no: existing[0].plate_no })]
    );

    sendResponse(res, 0, '删除成功');
  } catch (error) {
    console.error('删除会员车辆错误:', error);
    sendError(res, '删除失败', 500);
  }
}

module.exports = {
  getMemberVehicles,
  createMemberVehicle,
  updateMemberVehicle,
  deleteMemberVehicle,
};
