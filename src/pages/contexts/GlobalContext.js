// src/contexts/GlobalContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { get, post } from '../../utils/request';
import { Sid } from '../../utils/constant';

// 1. 创建全局上下文
const GlobalContext = createContext();

// 2. 封装全局Provider（提供者）：所有页面共享状态
export function GlobalProvider({ children }) {
  // 全局存储公共字段（所有页面都能用）
  const [globalField, setGlobalField] = useState(null);
  // 全局加载/错误状态
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  // 【关键】项目初始化时，只请求一次接口获取全局字段
  useEffect(() => {
    const getGlobalField = async () => {
      try {
        setGlobalLoading(true);
        // 获取全局字段接口」
        get('/r/w', { cmd: 'com.awspaas.user.apps.feymer.newportal.getUserInfo', sid: Sid }).then((res) => {
          if (res.result === 'ok') {
            const commonField = res.data;
            // 存入全局状态
            setGlobalField(commonField);
          }
        })
      } catch (err) {
        setGlobalError('全局字段获取失败：' + err.message);
      } finally {
        setGlobalLoading(false);
      }
    };

    // 执行请求（整个项目只执行这一次）
    getGlobalField();
  }, []);

  // 3. 把全局字段暴露给所有页面
  return (
    <GlobalContext.Provider 
      value={{ 
        globalField,    // 全局公共字段（核心）
        globalLoading,  // 全局加载状态
        globalError     // 全局错误状态
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

// 4. 封装自定义Hook：方便所有页面快速获取全局字段
export function useGlobal() {
  return useContext(GlobalContext);
}