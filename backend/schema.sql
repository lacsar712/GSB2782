-- 停车场管理系统数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS parking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE parking_system;

-- 7.1 登录用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'enabled', -- enabled/disabled
  remark VARCHAR(255) NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.2 系统设置表（KV）
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(64) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.3 收费规则（单条生效）
CREATE TABLE IF NOT EXISTS fee_rules (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  free_minutes INT NOT NULL DEFAULT 0,
  price_per_hour DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  daily_cap DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  rounding VARCHAR(16) NOT NULL DEFAULT '60min_up', -- 30min_up/60min_up
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.4 设备表（用于摄像头设备数等）
CREATE TABLE IF NOT EXISTS devices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(32) NOT NULL, -- camera/led/gate/other
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  remark VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_devices_type_active (type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.5 进出场记录
CREATE TABLE IF NOT EXISTS parking_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plate_no VARCHAR(32) NOT NULL,
  plate_color VARCHAR(16) NOT NULL DEFAULT 'blue',
  vehicle_type VARCHAR(16) NOT NULL DEFAULT 'normal', -- normal/special/member
  in_time DATETIME NOT NULL,
  out_time DATETIME NULL,
  status VARCHAR(8) NOT NULL DEFAULT 'in', -- in/out
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_plate_no (plate_no),
  INDEX idx_status_in_time (status, in_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.6 订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  record_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(16) NOT NULL DEFAULT 'unpaid', -- unpaid/paid
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_status_paid_at (status, paid_at),
  CONSTRAINT fk_orders_record FOREIGN KEY (record_id) REFERENCES parking_records(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.7 会员车辆
CREATE TABLE IF NOT EXISTS member_vehicles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plate_no VARCHAR(32) NOT NULL UNIQUE,
  member_type VARCHAR(16) NOT NULL DEFAULT 'month', -- month/year/vip
  expire_at DATETIME NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'enabled', -- enabled/disabled
  remark VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expire_at (expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.8 登录日志
CREATE TABLE IF NOT EXISTS login_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  ip VARCHAR(64) NOT NULL,
  success TINYINT(1) NOT NULL DEFAULT 1,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_logs_time (created_at),
  INDEX idx_login_logs_user (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7.9 操作日志
CREATE TABLE IF NOT EXISTS op_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  ip VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  detail TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_op_logs_time (created_at),
  INDEX idx_op_logs_user (username),
  INDEX idx_op_logs_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化系统设置
INSERT INTO system_settings (setting_key, setting_value) VALUES
('total_slots', '100'),
('led_welcome_text', '欢迎光临'),
('allow_plate_colors', '["blue","yellow","green"]'),
('allow_special_vehicle_types', '["police","fire","ambulance"]'),
('parking_lot_type', 'underground')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- 初始化收费规则
INSERT INTO fee_rules (id, free_minutes, price_per_hour, daily_cap, rounding) VALUES
(1, 15, 5.00, 50.00, '60min_up')
ON DUPLICATE KEY UPDATE
  free_minutes=VALUES(free_minutes),
  price_per_hour=VALUES(price_per_hour),
  daily_cap=VALUES(daily_cap),
  rounding=VALUES(rounding);

-- 初始化管理员账号（密码：admin123，使用bcrypt加密）
-- 注意：实际部署时应该修改密码
INSERT INTO users (username, password_hash, status, remark) VALUES
('admin', '$2b$10$7vEIOUDRIW5NEw3I1wJ82u3sw7e8KXZSPnB9fUbeoEJEtLqx7P8UO', 'enabled', '系统管理员')
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  status = VALUES(status),
  remark = VALUES(remark);

-- 初始化设备数据（示例）
INSERT INTO devices (name, type, is_active, remark) VALUES
('入口摄像头1', 'camera', 1, '主入口'),
('入口摄像头2', 'camera', 1, '副入口'),
('出口摄像头1', 'camera', 1, '主出口'),
('出口摄像头2', 'camera', 1, '副出口'),
('LED显示屏1', 'led', 1, '入口LED'),
('LED显示屏2', 'led', 1, '出口LED'),
('入口道闸1', 'gate', 1, '主入口道闸'),
('出口道闸1', 'gate', 1, '主出口道闸')
ON DUPLICATE KEY UPDATE name=VALUES(name);
