const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  let connection;

  try {
    console.log('🚀 开始初始化数据库...\n');

    // 连接MySQL（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('✅ 已连接到MySQL服务器');

    // 创建数据库
    const dbName = process.env.DB_NAME || 'parking_system';
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ 数据库 ${dbName} 已创建或已存在`);

    // 切换到目标数据库
    await connection.query(`USE ${dbName}`);

    // 读取并执行SQL文件
    const sqlFile = path.join(__dirname, '../../schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 移除CREATE DATABASE语句（已经创建了）
    const sqlWithoutCreateDB = sql
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/USE.*?;/gi, '');

    await connection.query(sqlWithoutCreateDB);
    console.log('✅ 数据库表结构已创建');

    // 创建管理员账号（密码：admin123）
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await connection.query(
      `INSERT INTO users (username, password_hash, status, remark)
       VALUES ('admin', ?, 'enabled', '系统管理员')
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         status = VALUES(status),
         remark = VALUES(remark)`,
      [hashedPassword]
    );

    console.log('✅ 管理员账号已创建');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   ⚠️  请在生产环境中修改默认密码！\n');

    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initDatabase();
