/**
 * 停车场管理系统 - 统一 HTTP 请求封装
 *
 * 核心约束：项目中所有 HTTP 请求必须通过此文件导出的方法调用
 * 禁止在其他文件中直接使用 axios 或 fetch
 */

import axios from 'axios';
import { createDiscreteApi } from 'naive-ui';

const { message } = createDiscreteApi(['message']);

// Token 存储键名
const TOKEN_KEY = 'parking_token';

// 创建 axios 实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动注入 token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理
http.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 如果后端返回的数据结构包含 code 字段
    if (data && typeof data.code !== 'undefined') {
      if (data.code === 0 || data.code === 200) {
        return data;
      } else {
        message.error(data.message || '请求失败');
        return Promise.reject(new Error(data.message || '请求失败'));
      }
    }

    return data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config?.url || '';
      const isLoginRequest = requestUrl.includes('/auth/login');

      switch (status) {
        case 401:
          if (isLoginRequest) {
            message.error(data?.message || '用户名或密码错误');
            break;
          }
          message.error(data?.message || '登录已过期，请重新登录');
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('ACCESS-TOKEN');
          // 跳转到登录页
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          if (isLoginRequest) {
            message.error(data?.message || '账号已被禁用');
          } else {
            message.error(data?.message || '没有权限访问');
          }
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error(error.message || '请求失败');
    }

    return Promise.reject(error);
  }
);

// ==================== 认证相关 API ====================

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise}
 */
export const login = (username, password) => {
  return http.post('/auth/login', { username, password });
};

/**
 * 用户登出
 * @returns {Promise}
 */
export const logout = () => {
  return http.post('/auth/logout');
};

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getCurrentUser = () => {
  return http.get('/auth/me');
};

// ==================== Dashboard API ====================

/**
 * 获取 Dashboard 汇总数据
 * @returns {Promise}
 */
export const getDashboardSummary = () => {
  return http.get('/dashboard/summary');
};

/**
 * 获取 Dashboard 图表数据
 * @param {number} range - 时间范围（7 或 30 天）
 * @returns {Promise}
 */
export const getDashboardCharts = (range = 7) => {
  return http.get('/dashboard/charts', { params: { range } });
};

// ==================== 系统设置 API ====================

/**
 * 获取系统设置
 * @returns {Promise}
 */
export const getSettings = () => {
  return http.get('/settings');
};

/**
 * 更新系统设置
 * @param {Object} data - 设置数据
 * @returns {Promise}
 */
export const updateSettings = (data) => {
  return http.post('/settings', data);
};

// ==================== 收费规则 API ====================

/**
 * 获取收费规则
 * @returns {Promise}
 */
export const getFeeRule = () => {
  return http.get('/fee-rule');
};

/**
 * 更新收费规则
 * @param {Object} data - 收费规则数据
 * @returns {Promise}
 */
export const updateFeeRule = (data) => {
  return http.post('/fee-rule', data);
};

// ==================== 进出场记录 API ====================

/**
 * 获取进出场记录列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getParkingRecords = (params) => {
  return http.get('/parking-records', { params });
};

/**
 * 生成模拟进出场记录（用于演示）
 * @returns {Promise}
 */
export const mockGenerateRecords = () => {
  return http.post('/parking-records/mock-generate');
};

// ==================== 会员车辆管理 API ====================

/**
 * 获取会员车辆列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getMemberVehicles = (params) => {
  return http.get('/member-vehicles', { params });
};

/**
 * 创建会员车辆
 * @param {Object} data - 会员车辆数据
 * @returns {Promise}
 */
export const createMemberVehicle = (data) => {
  return http.post('/member-vehicles', data);
};

/**
 * 更新会员车辆
 * @param {number} id - 会员车辆 ID
 * @param {Object} data - 会员车辆数据
 * @returns {Promise}
 */
export const updateMemberVehicle = (id, data) => {
  return http.put(`/member-vehicles/${id}`, data);
};

/**
 * 删除会员车辆
 * @param {number} id - 会员车辆 ID
 * @returns {Promise}
 */
export const deleteMemberVehicle = (id) => {
  return http.delete(`/member-vehicles/${id}`);
};

// ==================== 用户管理 API ====================

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getUsers = (params) => {
  return http.get('/users', { params });
};

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @returns {Promise}
 */
export const createUser = (data) => {
  return http.post('/users', data);
};

/**
 * 更新用户
 * @param {number} id - 用户 ID
 * @param {Object} data - 用户数据
 * @returns {Promise}
 */
export const updateUser = (id, data) => {
  return http.put(`/users/${id}`, data);
};

/**
 * 删除用户
 * @param {number} id - 用户 ID
 * @returns {Promise}
 */
export const deleteUser = (id) => {
  return http.delete(`/users/${id}`);
};

// ==================== 日志管理 API ====================

/**
 * 获取登录日志列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getLoginLogs = (params) => {
  return http.get('/logs/login', { params });
};

/**
 * 获取操作日志列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getOpLogs = (params) => {
  return http.get('/logs/ops', { params });
};

// ==================== Token 工具函数 ====================

/**
 * 保存 Token
 * @param {string} token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 获取 Token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 移除 Token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// 默认导出 axios 实例（仅供内部使用）
export default http;
