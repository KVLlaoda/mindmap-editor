// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { fixResizeObserverErrors } from './utils/resizeObserverPolyfill';

// 应用 ResizeObserver 错误修复
fixResizeObserverErrors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // 在开发环境中，React.StrictMode 会导致组件渲染两次，可能加剧 ResizeObserver 问题
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);