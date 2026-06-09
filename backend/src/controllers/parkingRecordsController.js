const db = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');

/**
 * 获取进出场记录列表
 * GET /api/parking-records
 */
async function getParkingRecords(req, res) {
  try {
    const { plate_no, status, start, end, page = 1, pageSize = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 构建查询条件
    let whereConditions = [];
    let params = [];

    if (plate_no) {
      whereConditions.push('plate_no LIKE ?');
      params.push(`%${plate_no}%`);
    }

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (start) {
      whereConditions.push('in_time >= ?');
      params.push(`${start} 00:00:00`);
    }

    if (end) {
      whereConditions.push('in_time <= ?');
      params.push(`${end} 23:59:59`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM parking_records ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询列表
    const [records] = await db.query(
      `SELECT * FROM parking_records ${whereClause} ORDER BY in_time DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    sendResponse(res, 0, 'success', {
      list: records,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('获取进出场记录错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

/**
 * 生成模拟数据（用于演示）
 * POST /api/parking-records/mock-generate
 */
async function mockGenerate(req, res) {
  try {
    const count = parseInt(req.body.count) || 50;

    const plateColors = ['blue', 'yellow', 'green', 'black', 'white'];
    const vehicleTypes = ['normal', 'special', 'member'];
    const statuses = ['in', 'out'];

    const records = [];
    for (let i = 0; i < count; i++) {
      const plateNo = `京A${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const plateColor = plateColors[Math.floor(Math.random() * plateColors.length)];
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const inTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const outTime = status === 'out' ? new Date(inTime.getTime() + Math.random() * 12 * 60 * 60 * 1000) : null;

      records.push([plateNo, plateColor, vehicleType, inTime, outTime, status]);
    }

    // 批量插入
    await db.query(
      `INSERT INTO parking_records (plate_no, plate_color, vehicle_type, in_time, out_time, status)
       VALUES ?`,
      [records]
    );

    sendResponse(res, 0, `成功生成${count}条模拟数据`);
  } catch (error) {
    console.error('生成模拟数据错误:', error);
    sendError(res, '生成数据失败', 500);
  }
}

module.exports = {
  getParkingRecords,
  mockGenerate,
};
