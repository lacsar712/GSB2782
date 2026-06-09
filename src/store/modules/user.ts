import { defineStore } from 'pinia';
import { store } from '@/store';
import { ACCESS_TOKEN, CURRENT_USER, IS_SCREENLOCKED } from '@/store/mutation-types';
import { ResultEnum } from '@/enums/httpEnum';

// 使用停车场管理系统的 HTTP 封装
import {
  login as loginApi,
  getCurrentUser,
  setToken as saveToken,
  removeToken,
} from '@/api/http.js';
import { storage } from '@/utils/Storage';

export type UserInfoType = {
  // TODO: add your own data
  username: string;
  email: string;
  avatar?: string;
};

export interface IUserState {
  token: string;
  username: string;
  welcome: string;
  avatar: string;
  permissions: any[];
  info: UserInfoType;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: storage.get(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: storage.get(CURRENT_USER, {}),
  }),
  getters: {
    getToken(): string {
      return this.token;
    },
    getAvatar(): string {
      return this.avatar;
    },
    getNickname(): string {
      return this.username;
    },
    getPermissions(): [any][] {
      return this.permissions;
    },
    getUserInfo(): UserInfoType {
      return this.info;
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },
    setPermissions(permissions) {
      this.permissions = permissions;
    },
    setUserInfo(info: UserInfoType) {
      this.info = info;
    },
    // 登录
    async login(params: any) {
      try {
        const response = await loginApi(params.username, params.password);
        const { data, code } = response;

        if (code === 0 || code === 200) {
          const ex = 7 * 24 * 60 * 60;
          // 保存 token
          saveToken(data.token);
          storage.set(ACCESS_TOKEN, data.token, ex);
          storage.set(CURRENT_USER, data.user, ex);
          storage.set(IS_SCREENLOCKED, false);
          this.setToken(data.token);
          this.setUserInfo(data.user);

          return { code: ResultEnum.SUCCESS, message: '登录成功' };
        }
        return { code: ResultEnum.ERROR, message: response.message || '登录失败' };
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || '登录失败';
        return { code: ResultEnum.ERROR, message: errorMessage };
      }
    },

    // 获取用户信息
    async getInfo() {
      try {
        const response = await getCurrentUser();
        // 兼容后端返回结构：{ data } 与历史结构 { result }
        const result = response?.data ?? response?.result;
        if (!result) {
          throw new Error('用户信息为空');
        }
        if (result) {
          this.setUserInfo(result);
          if (result.avatar) {
            this.setAvatar(result.avatar);
          }
        }
        return result;
      } catch (error) {
        throw new Error('获取用户信息失败');
      }
    },

    // 登出
    async logout() {
      this.setPermissions([]);
      this.setUserInfo({ username: '', email: '' });
      removeToken();
      storage.remove(ACCESS_TOKEN);
      storage.remove(CURRENT_USER);
    },
  },
});

// Need to be used outside the setup
export function useUser() {
  return useUserStore(store);
}
