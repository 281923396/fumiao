import axios from 'axios';
import { Domain } from './constant';
import { message } from 'antd';

// 创建 axios 实例
const service = axios.create({
  // 基准 URL（根据你的后端接口地址配置，可通过环境变量区分开发/生产环境）
  baseURL: Domain,
  // 请求超时时间
  timeout: 10000,
  // 允许携带跨域凭证（如需要）
  withCredentials: false
});

// -------------------------- 请求拦截器 --------------------------
service.interceptors.request.use(
  (config) => {
    // 1. 请求发送前的处理：比如添加 token 到请求头
    const token = localStorage.getItem('token'); // 假设 token 存在 localStorage 中
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 2. 统一设置请求头（如 Content-Type）
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    if (config.contentType) {
      config.headers['Content-Type'] = config.contentType;
    }
    return config;
  },
  (error) => {
    // 请求错误的预处理
    console.error('请求拦截器错误：', error);
    return Promise.reject(error);
  }
);

// -------------------------- 响应拦截器 --------------------------
service.interceptors.response.use(
  (response) => {
    // 1. 只返回响应的 data 部分（简化业务层调用）
    const res = response.data;
    const newRes = JSON.stringify(res)
    if (newRes.indexOf('用户会话已失效') > -1) {
      // document.body.innerHTML = res;
      document.write(res);
      document.close();
    } else if (res?.result === 'error') {
      message.error(res.msg);
    }
    return res;
    
    // 2. 统一处理后端返回的状态码（根据你的后端约定调整）
    // 示例：假设后端返回 code=200 表示成功
    // if (res.result !== '200') {
    //   // 非 200 状态码：提示错误信息
    //   alert(res.message || '请求失败');

    //   // 特殊状态码处理：比如 401 未登录/Token 过期
    //   if (res.code === 401) {
    //     alert('登录已过期，请重新登录');
    //     // 清除 token 并跳转到登录页
    //     localStorage.removeItem('token');
    //     window.location.href = '/login';
    //   }

    //   return Promise.reject(res);
    // }
  },
  (error) => {
    // 网络错误/服务器错误处理
    // console.error('响应拦截器错误：', error);
    // let errMsg = '请求失败，请稍后重试';
    
    // // 区分不同错误类型
    // if (error.response) {
    //   // 有响应但状态码非 2xx
    //   const status = error.response.status;
    //   switch (status) {
    //     case 404:
    //       errMsg = '请求的接口不存在';
    //       break;
    //     case 500:
    //       errMsg = '服务器内部错误';
    //       break;
    //     default:
    //       errMsg = error.response.data?.message || errMsg;
    //   }
    // } else if (error.request) {
    //   // 发了请求但没收到响应（网络问题）
    //   errMsg = '网络异常，请检查网络连接';
    // }
    return Promise.reject(error);
  }
);

// -------------------------- 封装常用请求方法 --------------------------
/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {object} params - URL 参数
 * @returns {Promise}
 */
export const get = (url, params = {}) => {
  return service.get(url, { params });
};

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求体数据
 * @returns {Promise}
 */
export const post = (url, data = {}, contentType) => {
  return service.post(url, data, contentType);
};

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {object} data - 请求体数据
 * @returns {Promise}
 */
export const put = (url, data = {}) => {
  return service.put(url, data);
};

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {object} params - URL 参数
 * @returns {Promise}
 */
export const del = (url, params = {}) => {
  return service.delete(url, { params });
};

// 导出默认的 axios 实例（如需自定义请求时使用）
export default service;