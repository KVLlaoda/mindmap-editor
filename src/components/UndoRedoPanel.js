// src/components/UndoRedoPanel.js
import React, { memo } from 'react';
import './UndoRedoPanel.css';

// 使用 memo 提高性能
const UndoRedoPanel = memo(({ canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <div className="undo-redo-panel">
      <button 
        className="undo-button" 
        onClick={onUndo} 
        disabled={!canUndo}
        title="撤销"
      >
        ↩️ 撤销
      </button>
      <button 
        className="redo-button" 
        onClick={onRedo} 
        disabled={!canRedo}
        title="重做"
      >
        ↪️ 重做
      </button>
    </div>
  );
});

export default UndoRedoPanel;