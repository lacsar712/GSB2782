# 停车场管理系统

基于 Vue 3 + Naive UI + ECharts + Node.js + MySQL 开发的停车场管理系统（前后端一体）。

## 原始需求

> 使用开源版的 naiveuiadmin 模版开发停车场管理系统，使用用户名密码登录，将所有的 http 请求封装到 1 个 js 文件中，管理员菜单包括，1 级菜单：数据中心，数据中心下的二级菜单包括 Dashboard 展示车场进出场车辆总数，总订单数，总收入摄像头设备数，空余车位数，显示最近 1 周或 1 月的进出场车辆数量柱状图和收入柱状图，一级菜单车场管理，下面包含系统设置菜单（设置车位总数，led 欢迎语设置，车牌颜色放行设置，特种车辆放行设置，车场类型设置等），收费规则设置菜单，车辆进出场记录菜单，车场会员车辆管理，用户管理菜单管理登录用户，日志管理菜单包含登录用户 ip，时间，操作内容等信息

## 项目特点

- ✅ **严格的 HTTP 封装约束** - 所有 HTTP 请求统一在 `src/api/http.js` 中管理
- ✅ **完整的功能模块** - 数据中心、系统设置、收费规则、进出场记录、会员管理、用户管理、日志管理
- ✅ **现代化技术栈** - Vue 3 + Vite + TypeScript + Naive UI + ECharts
- ✅ **良好的用户体验** - 表单验证、Loading 状态、消息提示、分页功能
- ✅ **响应式设计** - 图表自适应、表格分页

## 技术栈

- **框架**: Vue 3.5 + Vite 5.4
- **UI 组件库**: Naive UI 2.43
- **图表库**: ECharts 5.6
- **HTTP 客户端**: Axios 1.13
- **日期处理**: Day.js 1.11
- **状态管理**: Pinia 2.3
- **路由**: Vue Router 4.5
- **语言**: TypeScript 4.9

## 项目结构

```
src/
├── api/
│   └── http.js                    # 唯一 HTTP 请求文件（核心约束）
├── views/
│   ├── login/                     # 登录页
│   ├── data-center/
│   │   └── dashboard/             # Dashboard（5指标+2图表）
│   └── parking/
│       ├── system-settings/       # 系统设置
│       ├── fee-rules/             # 收费规则设置
│       ├── records/               # 车辆进出场记录
│       ├── members/               # 会员车辆管理
│       ├── users/                 # 用户管理
│       └── logs/                  # 日志管理
├── router/
│   └── modules/
│       ├── data-center.ts         # 数据中心路由
│       └── parking.ts             # 车场管理路由
├── store/
│   └── modules/
│       └── user.ts                # 用户状态管理
├── components/                    # 公共组件
├── utils/                         # 工具函数
└── styles/                        # 样式文件

backend/
├── src/
│   ├── controllers/               # 业务控制器
│   ├── routes/                    # 路由定义
│   └── scripts/                   # 初始化/造数脚本
├── schema.sql                     # 数据库结构
└── package.json                   # 后端脚本

docker-compose.yml                 # 容器化编排
```

## 功能模块

### 1. 数据中心 - Dashboard

- **5 个指标卡**

  - 进出场车辆总数
  - 总订单数
  - 总收入（货币格式）
  - 摄像头设备数
  - 空余车位数

- **2 个图表**
  - 进出场车辆数量柱状图
  - 收入柱状图
  - 支持 7 天/30 天 时间范围切换

### 2. 车场管理 - 系统设置

- 车位总数设置
- LED 欢迎语设置
- 车牌颜色放行（多选）
- 特种车辆放行（多选）
- 车场类型设置（单选）

### 3. 车场管理 - 收费规则设置

- 免费分钟数（0-120 分钟）
- 每小时单价
- 日封顶金额
- 计费取整规则（30 分钟/60 分钟进位）
- 实时计费示例计算

### 4. 车场管理 - 车辆进出场记录

- 车牌号模糊搜索
- 状态筛选（在场/已离场）
- 时间范围筛选
- 停车时长自动计算
- 分页功能

### 5. 车场管理 - 会员车辆管理

- 完整的 CRUD 功能
- 会员类型（月卡/年卡/VIP）
- 有效期管理
- 状态管理（正常/已过期/已禁用）

### 6. 车场管理 - 用户管理

- 用户 CRUD 功能
- 启用/禁用用户
- 最近登录时间记录

### 7. 车场管理 - 日志管理

- 登录日志（用户名、IP、时间、结果）
- 操作日志（操作类型、详情）

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8 (推荐) 或 npm >= 8

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### Docker 运行（推荐）

```bash
docker compose up -d --build
```

访问地址：

- 前端: http://localhost
- 后端: http://localhost:3000

### 默认测试账号

数据库初始化完成后，可使用以下账号登录：

- 用户名: `admin`
- 密码: `admin123`

若本地未生成管理员账号，可执行：

```bash
pnpm --dir backend run init-db
```

### 开发环境运行

```bash
pnpm dev
# 或
npm run dev
```

访问地址: http://localhost:8001/

### 生产环境构建

```bash
pnpm build
# 或
npm run build
```

### 预览生产构建

```bash
pnpm preview
# 或
npm run preview
```

### 生成图表测试数据（用于 Dashboard）

```bash
pnpm --dir backend run seed-chart-data
```

如果你使用默认 Docker MySQL 配置，可直接执行：

```bash
DB_HOST=127.0.0.1 DB_PASSWORD=root123456 pnpm --dir backend run seed-chart-data
```

## 环境配置

### 开发环境 (.env.development)

```env
VITE_API_BASE_URL = http://localhost:3000/api
```

### 生产环境 (.env.production)

```env
VITE_API_BASE_URL = https://api.parking.example.com/api
```

## API 接口说明

所有 API 接口都在 `src/api/http.js` 中定义，共 21 个接口：

### 认证相关 (3 个)

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### Dashboard (2 个)

- `GET /api/dashboard/summary` - 获取汇总数据
- `GET /api/dashboard/charts?range=7|30` - 获取图表数据

### 系统设置 (2 个)

- `GET /api/settings` - 获取系统设置
- `POST /api/settings` - 更新系统设置

### 收费规则 (2 个)

- `GET /api/fee-rule` - 获取收费规则
- `POST /api/fee-rule` - 更新收费规则

### 进出场记录 (2 个)

- `GET /api/parking-records` - 获取记录列表
- `POST /api/parking-records/mock-generate` - 生成模拟数据

### 会员车辆 (4 个)

- `GET /api/member-vehicles` - 获取会员列表
- `POST /api/member-vehicles` - 创建会员
- `PUT /api/member-vehicles/{id}` - 更新会员
- `DELETE /api/member-vehicles/{id}` - 删除会员

### 用户管理 (4 个)

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户

### 日志管理 (2 个)

- `GET /api/logs/login` - 获取登录日志
- `GET /api/logs/ops` - 获取操作日志

## 后端 API 说明

后端已在 `backend/` 目录实现，可直接运行。

### 数据库表结构

需要创建以下 9 张表：

1. `users` - 登录用户表
2. `system_settings` - 系统设置表（KV 存储）
3. `fee_rules` - 收费规则表
4. `devices` - 设备表（摄像头、LED 等）
5. `parking_records` - 进出场记录表
6. `orders` - 订单表
7. `member_vehicles` - 会员车辆表
8. `login_logs` - 登录日志表
9. `op_logs` - 操作日志表

## 代码架构

### 整体架构

本项目采用经典的前后端分离架构，前端基于 Vue 3 生态系统，后端使用 Node.js + Express + MySQL。

```
┌─────────────────────────────────────────────────────────────┐
│                         前端层                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue 3 + Vite + TypeScript + Naive UI + ECharts     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HTTP 封装层 (src/api/http.js) - 唯一请求入口       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                         后端层                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express 路由层 (JWT 认证中间件)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  控制器层 (8个控制器，21个API接口)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  数据访问层 (MySQL连接池)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据持久层                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MySQL 8.0 (9张表)                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 前端架构

#### 1. 目录结构

```
src/
├── api/
│   └── http.js                 # ⭐ HTTP封装层（核心约束）
│                               # - axios实例配置
│                               # - 请求/响应拦截器
│                               # - 21个API方法
│                               # - token管理
│
├── views/                      # 页面组件层
│   ├── login/                  # 登录模块
│   ├── data-center/            # 数据中心模块
│   │   └── dashboard/          # - Dashboard页面
│   └── parking/                # 车场管理模块
│       ├── system-settings/    # - 系统设置
│       ├── fee-rules/          # - 收费规则
│       ├── records/            # - 进出场记录
│       ├── members/            # - 会员管理
│       ├── users/              # - 用户管理
│       └── logs/               # - 日志管理
│
├── router/                     # 路由层
│   ├── index.ts                # 路由主配置
│   └── modules/                # 路由模块
│       ├── data-center.ts      # - 数据中心路由
│       └── parking.ts          # - 车场管理路由
│
├── store/                      # 状态管理层
│   └── modules/
│       └── user.ts             # 用户状态（Pinia）
│
├── components/                 # 公共组件层
├── utils/                      # 工具函数层
└── styles/                     # 样式层
```

#### 2. 数据流

```
用户操作 → Vue组件 → API调用(http.js) → 后端接口
                ↓
            状态更新(Pinia)
                ↓
            视图更新(Vue)
```

#### 3. HTTP 封装层设计

**核心文件**: `src/api/http.js` (317 行)

**设计原则**:

- 单一职责：所有 HTTP 请求统一管理
- 请求拦截：自动注入 JWT token
- 响应拦截：统一错误处理
- 类型安全：TypeScript 类型定义

**关键功能**:

```javascript
// 1. axios实例配置
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// 2. 请求拦截器（自动注入token）
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. 响应拦截器（统一错误处理）
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 自动跳转登录
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. API方法导出（21个）
export const login = (username, password) => { ... };
export const getDashboardSummary = () => { ... };
// ... 其他19个API方法
```

### 后端架构

#### 1. 目录结构

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # 数据库连接池配置
│   │
│   ├── middleware/
│   │   └── auth.js             # JWT认证中间件
│   │
│   ├── controllers/            # 控制器层（业务逻辑）
│   │   ├── authController.js       # 认证控制器
│   │   ├── dashboardController.js  # Dashboard控制器
│   │   ├── settingsController.js   # 系统设置控制器
│   │   ├── feeRuleController.js    # 收费规则控制器
│   │   ├── parkingRecordsController.js  # 进出场记录控制器
│   │   ├── memberVehiclesController.js  # 会员车辆控制器
│   │   ├── usersController.js      # 用户管理控制器
│   │   └── logsController.js       # 日志管理控制器
│   │
│   ├── routes/                 # 路由层
│   │   ├── auth.js             # 认证路由
│   │   └── api.js              # API路由
│   │
│   ├── utils/
│   │   └── helpers.js          # 工具函数
│   │
│   └── app.js                  # Express应用主文件
│
└── schema.sql                  # 数据库DDL脚本
```

#### 2. 请求处理流程

```
HTTP请求 → Express路由 → JWT认证中间件 → 控制器
                                          ↓
                                    数据库操作
                                          ↓
                                    响应数据 → 客户端
```

#### 3. 数据库设计

**9 张表**:

1. `users` - 用户表（登录认证）
2. `system_settings` - 系统设置表（KV 存储）
3. `fee_rules` - 收费规则表
4. `devices` - 设备表（摄像头、LED 等）
5. `parking_records` - 进出场记录表
6. `orders` - 订单表
7. `member_vehicles` - 会员车辆表
8. `login_logs` - 登录日志表
9. `op_logs` - 操作日志表

**关键索引**:

- `parking_records`: idx_plate_no, idx_status_in_time
- `login_logs`: idx_login_logs_time, idx_login_logs_user
- `op_logs`: idx_op_logs_time, idx_op_logs_user, idx_op_logs_action
- `member_vehicles`: idx_expire_at

## 技术细节

### 1. 认证与授权

**JWT 认证流程**:

```
1. 用户登录 → 后端验证 → 生成JWT token
2. 前端存储token到localStorage
3. 后续请求自动携带token（请求拦截器）
4. 后端验证token（JWT中间件）
5. token过期/无效 → 401 → 自动跳转登录
```

**安全措施**:

- 密码 bcrypt 加密（salt rounds: 10）
- JWT 签名验证
- token 过期时间：7 天
- 登录日志记录（IP、User Agent、结果）

### 2. 状态管理

**Pinia Store 设计**:

```typescript
// store/modules/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: null,
  }),
  actions: {
    async login(params) {
      const response = await loginApi(params.username, params.password);
      this.token = response.data.token;
      setToken(this.token);
      this.userInfo = response.data.user;
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      removeToken();
    },
  },
});
```

### 3. 路由守卫

**认证守卫**:

```typescript
router.beforeEach((to, from, next) => {
  const token = getToken();

  if (to.path === '/login') {
    // 已登录跳转到首页
    next(token ? '/' : undefined);
  } else {
    // 未登录跳转到登录页
    next(token ? undefined : '/login');
  }
});
```

### 4. 数据可视化

**ECharts 配置**:

```javascript
// 柱状图配置
const option = {
  xAxis: {
    type: 'category',
    data: days, // ['2026-02-01', '2026-02-02', ...]
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'bar',
      data: values, // [12, 15, 20, ...]
      itemStyle: {
        color: '#18a058', // Naive UI主题色
      },
    },
  ],
  // 响应式配置
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
};

// 窗口大小变化时自动调整
window.addEventListener('resize', () => {
  chart.resize();
});
```

### 5. 表单验证

**Naive UI 表单验证**:

```typescript
const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
};

// 提交前验证
const handleSubmit = async () => {
  await formRef.value?.validate();
  // 验证通过后提交
};
```

### 6. 分页处理

**前端分页配置**:

```typescript
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadData();
  },
  itemCount: 0,
});
```

**后端分页查询**:

```javascript
const offset = (page - 1) * pageSize;
const limit = pageSize;

const [records] = await db.query('SELECT * FROM parking_records LIMIT ? OFFSET ?', [limit, offset]);
```

### 7. 错误处理

**统一错误处理**:

```javascript
// 前端
try {
  const res = await api();
  if (res.code === 0) {
    message.success('操作成功');
  }
} catch (error) {
  message.error('操作失败');
}

// 后端
try {
  // 业务逻辑
  sendResponse(res, 0, 'success', data);
} catch (error) {
  console.error('错误:', error);
  sendError(res, '操作失败', 500);
}
```

### 8. 日志记录

**登录日志**:

```javascript
await db.query('INSERT INTO login_logs (username, ip, success, user_agent) VALUES (?, ?, ?, ?)', [
  username,
  clientIp,
  success ? 1 : 0,
  userAgent,
]);
```

**操作日志**:

```javascript
await db.query('INSERT INTO op_logs (username, ip, action, detail) VALUES (?, ?, ?, ?)', [
  username,
  clientIp,
  'UPDATE_SETTINGS',
  JSON.stringify(data),
]);
```

### 9. 性能优化

**前端优化**:

- 路由懒加载：`component: () => import('@/views/...')`
- 图表按需加载：只在 Dashboard 页面引入 ECharts
- 防抖/节流：搜索输入框使用防抖

**后端优化**:

- 数据库连接池：复用连接，提高性能
- 索引优化：为常用查询字段添加索引
- 分页查询：避免一次性加载大量数据

**数据库优化**:

```sql
-- 为常用查询添加索引
CREATE INDEX idx_plate_no ON parking_records(plate_no);
CREATE INDEX idx_status_in_time ON parking_records(status, in_time);
CREATE INDEX idx_login_logs_time ON login_logs(created_at);
```

### 10. 开发调试

**前端调试**:

```bash
# 开发模式（热重载）
pnpm dev

# 查看网络请求
浏览器开发者工具 → Network

# 查看Vue组件状态
Vue DevTools
```

**后端调试**:

```bash
# 开发模式（自动重启）
npm run dev

# 查看日志
console.log输出到终端

# 测试API
./test-api.sh
```

## 核心约束

⚠️ **重要**: 项目中所有 HTTP 请求必须通过 `src/api/http.js` 调用，禁止在其他文件中直接使用 axios 或 fetch。

验证方式：

```bash
# 搜索项目中是否有违规的 axios 或 fetch 调用
grep -r "axios\." src/ --exclude-dir=node_modules --exclude=http.js
grep -r "fetch(" src/ --exclude-dir=node_modules --exclude=http.js
```

应该只返回 `src/api/http.js` 中的结果。

**验证结果**: ✅ 已通过验证，无违规调用

## 开发规范

### 代码风格

- 使用 TypeScript
- 使用 ESLint + Prettier 进行代码格式化
- 组件使用 `<script setup>` 语法
- 所有文案使用中文

### 提交规范

```bash
# 格式化代码
pnpm lint:prettier

# ESLint 检查
pnpm lint:eslint

# 样式检查
pnpm lint:stylelint
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 常见问题

### 1. 如何修改 API 基础地址？

修改 `.env.development` 或 `.env.production` 文件中的 `VITE_API_BASE_URL` 配置。

### 2. 如何添加新的 API 接口？

在 `src/api/http.js` 文件中添加新的导出函数。

### 3. 登录失败怎么办？

检查：

1. 后端 API 是否正常运行
2. API 基础地址配置是否正确
3. 浏览器控制台是否有错误信息
4. 执行 `pnpm --dir backend run init-db` 重置管理员账号（`admin/admin123`）

### 4. 图表不显示怎么办？

检查：

1. 后端 API 是否返回正确的数据格式
2. 浏览器控制台是否有错误
3. 窗口大小改变时图表是否自动调整

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。

---
