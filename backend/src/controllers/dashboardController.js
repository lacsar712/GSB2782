const db = require('../config/database');
const { sendResponse, sendError } = require('../utils/helpers');

/**
 * 获取Dashboard汇总数据
 * GET /api/dashboard/summary
 */
async function getSummary(req, res) {
  try {
    // 1. 进出场车辆总数
    const [vehicleCount] = await db.query('SELECT COUNT(*) as count FROM parking_records');
    const total_vehicle_events = vehicleCount[0].count;

    // 2. 总订单数
    const [orderCount] = await db.query('SELECT COUNT(*) as count FROM orders');
    const total_orders = orderCount[0].count;

    // 3. 总收入（已支付订单）
    const [revenueSum] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = 'paid'"
    );
    const total_revenue = parseFloat(revenueSum[0].total);

    // 4. 摄像头设备数
    const [cameraCount] = await db.query(
      "SELECT COUNT(*) as count FROM devices WHERE type = 'camera' AND is_active = 1"
    );
    const camera_count = cameraCount[0].count;

    // 5. 空余车位数 = 车位总数 - 在场车辆数
    const [settingsResult] = await db.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'total_slots'"
    );
    const totalSlots = settingsResult.length > 0 ? parseInt(settingsResult[0].setting_value) : 100;

    const [inCount] = await db.query("SELECT COUNT(*) as count FROM parking_records WHERE status = 'in'");
    const free_slots = Math.max(0, totalSlots - inCount[0].count);

    sendResponse(res, 0, 'success', {
      total_vehicle_events,
      total_orders,
      total_revenue,
      camera_count,
      free_slots,
    });
  } catch (error) {
    console.error('获取Dashboard汇总数据错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

/**
 * 获取Dashboard图表数据
 * GET /api/dashboard/charts?range=7
 */
async function getCharts(req, res) {
  try {
    const range = parseInt(req.query.range) || 7; // 默认7天
    const days = range === 30 ? 30 : 7;
    const formatDateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 生成日期数组
    const dateArray = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateArray.push(formatDateKey(date));
    }

    // 查询每天的进出场车辆数量
    const [vehicleData] = await db.query(
      `SELECT DATE_FORMAT(in_time, '%Y-%m-%d') as date_key, COUNT(*) as count
       FROM parking_records
       WHERE in_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY date_key
       ORDER BY date_key`,
      [days]
    );

    // 查询每天的收入
    const [revenueData] = await db.query(
      `SELECT DATE_FORMAT(o.paid_at, '%Y-%m-%d') as date_key, SUM(o.amount) as total
       FROM orders o
       WHERE o.status = 'paid' AND o.paid_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY date_key
       ORDER BY date_key`,
      [days]
    );

    // 构建数据映射
    const vehicleMap = {};
    vehicleData.forEach((item) => {
      vehicleMap[item.date_key] = item.count;
    });

    const revenueMap = {};
    revenueData.forEach((item) => {
      revenueMap[item.date_key] = parseFloat(item.total);
    });

    // 填充完整的日期数据
    const vehicle_counts = dateArray.map((date) => vehicleMap[date] || 0);
    const revenue_amounts = dateArray.map((date) => revenueMap[date] || 0);

    sendResponse(res, 0, 'success', {
      days: dateArray,
      vehicle_counts,
      revenue_amounts,
    });
  } catch (error) {
    console.error('获取Dashboard图表数据错误:', error);
    sendError(res, '获取数据失败', 500);
  }
}

module.exports = {
  getSummary,
  getCharts,
};
