// src/components/OutlineEditor.js
import React, { useCallback, memo } from 'react';
import './OutlineEditor.css';

// 使用 memo 提高性能
const OutlineEditor = memo(({ value, onChange }) => {
  // 处理按键事件，支持Tab键缩进
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      // 获取光标位置
      const cursorPosition = e.target.selectionStart;
      const currentValue = e.target.value;
      
      // 在光标位置插入制表符
      const newValue = 
        currentValue.substring(0, cursorPosition) + 
        '\t' + 
        currentValue.substring(cursorPosition);
      
      // 更新文本并设置新的光标位置
      onChange(newValue);
      
      // 手动设置新的光标位置
      setTimeout(() => {
        e.target.selectionStart = cursorPosition + 1;
        e.target.selectionEnd = cursorPosition + 1;
      }, 0);
    }
  }, [onChange]);

  return (
    <div className="outline-editor">
      <h3>大纲编辑器</h3>
      <div className="editor-container">
        {/* 使用原生textarea而不是CodeEditor组件，确保Tab键工作正常 */}
        <textarea
          value={value}
          placeholder="输入你的大纲内容，使用Tab键缩进表示层级关系"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="outline-textarea"
        />
      </div>
      <div className="editor-guide">
        <p>使用说明：</p>
        <ul>
          <li>每行一个主题</li>
          <li>使用Tab键增加缩进级别</li>
          <li>使用Shift+Tab减少缩进级别</li>
          <li>使用Enter键创建新主题</li>
        </ul>
      </div>
    </div>
  );
});

export default OutlineEditor;