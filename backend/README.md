# 停车场管理系统 - 后端API

基于 Node.js + Express + MySQL 开发的停车场管理系统后端服务。

## 技术栈

- **框架**: Express 4.18
- **数据库**: MySQL 8.0
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **环境变量**: dotenv
- **开发工具**: nodemon

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=parking_system

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### 3. 初始化数据库

```bash
npm run init-db
```

这将创建数据库、表结构，并初始化管理员账号：
- 用户名: `admin`
- 密码: `admin123`

⚠️ **重要**: 生产环境请立即修改默认密码！

### 4. 启动服务

开发环境（自动重启）：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 接口文档

### 认证相关 (3个)

#### 1. 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "status": "enabled"
    }
  }
}
```

#### 2. 用户登出
```
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "code": 0,
  "message": "登出成功"
}
```

#### 3. 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "status": "enabled",
    ...
  }
}
```

### Dashboard (2个)

#### 1. 获取汇总数据
```
GET /api/dashboard/summary
Authorization: Bearer {token}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "total_vehicle_events": 1234,
    "total_orders": 567,
    "total_revenue": 12345.67,
    "camera_count": 8,
    "free_slots": 45
  }
}
```

#### 2. 获取图表数据
```
GET /api/dashboard/charts?range=7
Authorization: Bearer {token}

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "days": ["2026-02-01", "2026-02-02", ...],
    "vehicle_counts": [12, 15, 20, ...],
    "revenue_amounts": [120.5, 180.0, ...]
  }
}
```

### 系统设置 (2个)

#### 1. 获取系统设置
```
GET /api/settings
Authorization: Bearer {token}
```

#### 2. 更新系统设置
```
POST /api/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "total_slots": 100,
  "led_welcome_text": "欢迎光临",
  "allow_plate_colors": ["blue", "yellow", "green"],
  "allow_special_vehicle_types": ["police", "fire", "ambulance"],
  "parking_lot_type": "underground"
}
```

### 收费规则 (2个)

#### 1. 获取收费规则
```
GET /api/fee-rule
Authorization: Bearer {token}
```

#### 2. 更新收费规则
```
POST /api/fee-rule
Authorization: Bearer {token}
Content-Type: application/json

{
  "free_minutes": 15,
  "price_per_hour": 5.00,
  "daily_cap": 50.00,
  "rounding": "60min_up"
}
```

### 进出场记录 (2个)

#### 1. 获取记录列表
```
GET /api/parking-records?plate_no=&status=&start=&end=&page=1&pageSize=10
Authorization: Bearer {token}
```

#### 2. 生成模拟数据
```
POST /api/parking-records/mock-generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "count": 50
}
```

### 会员车辆 (4个)

```
GET    /api/member-vehicles?page=1&pageSize=10
POST   /api/member-vehicles
PUT    /api/member-vehicles/:id
DELETE /api/member-vehicles/:id
```

### 用户管理 (4个)

```
GET    /api/users?page=1&pageSize=10
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### 日志管理 (2个)

```
GET /api/logs/login?page=1&pageSize=20
GET /api/logs/ops?page=1&pageSize=20
```

## 数据库表结构

共9张表：

1. `users` - 登录用户表
2. `system_settings` - 系统设置表（KV存储）
3. `fee_rules` - 收费规则表
4. `devices` - 设备表（摄像头、LED等）
5. `parking_records` - 进出场记录表
6. `orders` - 订单表
7. `member_vehicles` - 会员车辆表
8. `login_logs` - 登录日志表
9. `op_logs` - 操作日志表

详细DDL请查看 `schema.sql` 文件。

## 项目结构

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # 数据库连接配置
│   ├── controllers/             # 控制器
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── settingsController.js
│   │   ├── feeRuleController.js
│   │   ├── parkingRecordsController.js
│   │   ├── memberVehiclesController.js
│   │   ├── usersController.js
│   │   └── logsController.js
│   ├── middleware/
│   │   └── auth.js              # JWT认证中间件
│   ├── routes/
│   │   ├── auth.js              # 认证路由
│   │   └── api.js               # API路由
│   ├── utils/
│   │   └── helpers.js           # 工具函数
│   ├── scripts/
│   │   └── init-db.js           # 数据库初始化脚本
│   └── app.js                   # 主应用文件
├── schema.sql                   # 数据库DDL脚本
├── package.json
├── .env                         # 环境变量配置
└── .env.example                 # 环境变量示例
```

## 开发说明

### 添加新的API接口

1. 在 `src/controllers/` 中创建或修改控制器
2. 在 `src/routes/api.js` 中添加路由
3. 重启服务

### 数据库迁移

修改 `schema.sql` 后，重新运行：

```bash
npm run init-db
```

### 日志记录

- 登录日志自动记录在 `login_logs` 表
- 操作日志在关键操作时记录在 `op_logs` 表

## 安全建议

1. **修改默认密码**: 初始化后立即修改admin密码
2. **JWT密钥**: 生产环境使用强随机密钥
3. **HTTPS**: 生产环境启用HTTPS
4. **数据库权限**: 使用专用数据库用户，限制权限
5. **请求限流**: 添加rate limiting中间件
6. **输入验证**: 使用express-validator验证输入

## 常见问题

### 1. 数据库连接失败

检查：
- MySQL服务是否启动
- `.env` 中的数据库配置是否正确
- 数据库用户权限是否足够

### 2. JWT token无效

检查：
- token是否过期
- JWT_SECRET是否一致
- Authorization header格式是否正确

### 3. CORS错误

后端已配置CORS，如仍有问题，检查前端请求地址是否正确。

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue。
