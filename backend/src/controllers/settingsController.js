const db = require('../config/database');
const { sendResponse, sendError, getClientIp } = require('../utils/helpers');

/**
 * 获取系统设置
 * GET /api/settings
 */
async function getSettings(req, res) {
  try {
    const [settings] = await db.query('SELECT setting_key, setting_value FROM system_settings');

    const result = {};
    settings.forEach((item) => {
      const key = item.setting_key;
      let value = item.setting_value;

      // 解析JSON字符串
      if (key === 'allow_plate_colors' || key === 'allow_special_vehicle_types') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = [];
        }
      } else if (key === 'total_slots') {
        value = parseInt(value);
      }

      result[key] = value;
    });

    sendResponse(res, 0, 'success', result);
  } catch (error) {
    console.error('获取系统设置错误:', error);
    sendError(res, '获取设置失败', 500);
  }
}

/**
 * 更新系统设置
 * POST /api/settings
 */
async function updateSettings(req, res) {
  try {
    const {
      total_slots,
      led_welcome_text,
      allow_plate_colors,
      allow_special_vehicle_types,
      parking_lot_type,
    } = req.body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 更新各个设置项
      if (total_slots !== undefined) {
        await connection.query(
          `INSERT INTO system_settings (setting_key, setting_value)
           VALUES ('total_slots', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [total_slots.toString()]
        );
      }

      if (led_welcome_text !== undefined) {
        await connection.query(
          `INSERT INTO system_settings (setting_key, setting_value)
           VALUES ('led_welcome_text', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [led_welcome_text]
        );
      }

      if (allow_plate_colors !== undefined) {
        await connection.query(
          `INSERT INTO system_settings (setting_key, setting_value)
           VALUES ('allow_plate_colors', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [JSON.stringify(allow_plate_colors)]
        );
      }

      if (allow_special_vehicle_types !== undefined) {
        await connection.query(
          `INSERT INTO system_settings (setting_key, setting_value)
           VALUES ('allow_special_vehicle_types', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [JSON.stringify(allow_special_vehicle_types)]
        );
      }

      if (parking_lot_type !== undefined) {
        await connection.query(
          `INSERT INTO system_settings (setting_key, setting_value)
           VALUES ('parking_lot_type', ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [parking_lot_type]
        );
      }

      await connection.commit();

      // 记录操作日志
      const username = req.user.username;
      const clientIp = getClientIp(req);
      await db.query(
        'INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)',
        [username, clientIp, 'UPDATE_SETTINGS', JSON.stringify(req.body)]
      );

      sendResponse(res, 0, '保存成功');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新系统设置错误:', error);
    sendError(res, '保存失败', 500);
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
