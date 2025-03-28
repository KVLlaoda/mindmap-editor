// src/utils/resizeObserverPolyfill.js
// 处理 ResizeObserver 循环错误

// 此文件用于捕获和抑制 ResizeObserver 循环错误
export const fixResizeObserverErrors = () => {
    // 保存原始的 console.error 函数
    const originalError = window.console.error;
    
    // 覆盖 console.error 以过滤 ResizeObserver 循环错误
    window.console.error = (...args) => {
      // 检查是否为 ResizeObserver 循环错误
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes('ResizeObserver loop')) {
        // 忽略此错误
        return;
      }
      
      // 对于其他错误，保持原始行为
      originalError(...args);
    };
    
    // 捕获全局错误事件
    window.addEventListener('error', (event) => {
      if (event && event.message && typeof event.message === 'string' && 
          event.message.includes('ResizeObserver loop')) {
        // 阻止错误传播
        event.stopImmediatePropagation();
        // 标记为已处理
        event.preventDefault();
        return false;
      }
    }, true);
    
    // 捕获未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      if (event && event.reason && typeof event.reason.message === 'string' && 
          event.reason.message.includes('ResizeObserver loop')) {
        // 阻止拒绝传播
        event.stopImmediatePropagation();
        // 标记为已处理
        event.preventDefault();
        return false;
      }
    }, true);
  };