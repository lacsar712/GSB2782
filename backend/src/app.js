const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 停车场管理系统后端服务已启动');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('可用的API端点:');
  console.log('  POST   /api/auth/login          - 用户登录');
  console.log('  POST   /api/auth/logout         - 用户登出');
  console.log('  GET    /api/auth/me             - 获取当前用户信息');
  console.log('  GET    /api/dashboard/summary   - 获取Dashboard汇总数据');
  console.log('  GET    /api/dashboard/charts    - 获取Dashboard图表数据');
  console.log('  GET    /api/settings            - 获取系统设置');
  console.log('  POST   /api/settings            - 更新系统设置');
  console.log('  GET    /api/fee-rule            - 获取收费规则');
  console.log('  POST   /api/fee-rule            - 更新收费规则');
  console.log('  GET    /api/parking-records     - 获取进出场记录');
  console.log('  POST   /api/parking-records/mock-generate - 生成模拟数据');
  console.log('  GET    /api/member-vehicles     - 获取会员车辆列表');
  console.log('  POST   /api/member-vehicles     - 创建会员车辆');
  console.log('  PUT    /api/member-vehicles/:id - 更新会员车辆');
  console.log('  DELETE /api/member-vehicles/:id - 删除会员车辆');
  console.log('  GET    /api/users               - 获取用户列表');
  console.log('  POST   /api/users               - 创建用户');
  console.log('  PUT    /api/users/:id           - 更新用户');
  console.log('  DELETE /api/users/:id           - 删除用户');
  console.log('  GET    /api/logs/login          - 获取登录日志');
  console.log('  GET    /api/logs/ops            - 获取操作日志');
  console.log('');
});

module.exports = app;
