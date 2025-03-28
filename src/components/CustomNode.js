// src/components/CustomNode.js
import React, { memo, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNode.css';

// 使用 memo 优化渲染性能
const CustomNode = memo(({ data, id }) => {
  // 使用回调函数而不是内联函数，避免不必要的重新渲染
  const handleUndo = useCallback(() => {
    if (data.onNodeOperation) {
      data.onNodeOperation(data.nodeId, 'undo');
    }
  }, [data]);
  
  const handleRedo = useCallback(() => {
    if (data.onNodeOperation) {
      data.onNodeOperation(data.nodeId, 'redo');
    }
  }, [data]);
  
  // 判断是否为根节点
  const isRootNode = id === 'node-0';
  
  return (
    <div 
      className={`custom-node ${isRootNode ? 'root-node' : ''}`}
      data-id={id} // 添加ID属性用于CSS选择器
    >
      {/* 添加顶部连接点，作为上游连接的入口 */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', visibility: 'visible' }}
        isConnectable={true}
      />
      
      <div className="node-content">
        {data.label || ''}
      </div>
      
      {/* 添加右侧连接点，作为下游连接的出口 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', visibility: 'visible' }}
        isConnectable={true}
      />
      
      <div className="node-actions">
        <button 
          className="node-action-button undo"
          onClick={handleUndo}
          title="撤销此节点"
        >
          ↩️
        </button>
        <button 
          className="node-action-button redo"
          onClick={handleRedo}
          title="重做此节点"
        >
          ↪️
        </button>
      </div>
    </div>
  );
});

// 显式设置组件名称，有助于调试
CustomNode.displayName = 'CustomNode';

export default CustomNode;