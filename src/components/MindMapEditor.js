// src/components/MindMapEditor.js
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  BezierEdge,
  SmoothStepEdge,
  StepEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import OutlineEditor from './OutlineEditor';
import UndoRedoPanel from './UndoRedoPanel';
import CustomNode from './CustomNode';
import './MindMapEditor.css';
import { processOutlineToNodesEdges } from '../utils/outlineProcessor';

// 设置初始大纲文本
const initialOutline = `思维导图示例
\t子主题1
\t\t子主题1.1
\t\t子主题1.2
\t子主题2
\t\t子主题2.1
\t\t\t子主题2.1.1
\t子主题3`;

// 定义延迟时间（毫秒）- 用于输入延迟记录
const HISTORY_DELAY = 800;

const MindMapEditor = () => {
  // 大纲文本状态
  const [outline, setOutline] = useState(initialOutline);
  
  // 历史记录状态
  const [history, setHistory] = useState([initialOutline]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // 节点和边的状态
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // 使用ref保存当前输入状态和定时器
  const timerRef = useRef(null);
  const pendingTextRef = useRef(initialOutline);
  const isUndoingRef = useRef(false);
  
  // 定义自定义节点类型
  const nodeTypes = useMemo(() => ({
    customNode: CustomNode,
  }), []);
  
  // 定义边类型
  const edgeTypes = useMemo(() => ({
    default: BezierEdge,
    smoothstep: SmoothStepEdge,
    step: StepEdge,
  }), []);
  
  // 处理连接事件
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 延迟记录历史的函数
  const addToHistory = useCallback((newText) => {
    if (isUndoingRef.current) return; // 如果是撤销/重做操作，不要延迟记录
    
    // 更新待处理文本
    pendingTextRef.current = newText;
    
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      // 只有当文本与最后一条历史记录不同时才添加
      if (pendingTextRef.current !== history[historyIndex]) {
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(pendingTextRef.current);
          return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
      }
    }, HISTORY_DELAY);
  }, [history, historyIndex]);

  // 更新大纲文本
  const handleOutlineChange = useCallback((newOutline) => {
    setOutline(newOutline);
    // 延迟添加到历史记录
    addToHistory(newOutline);
  }, [addToHistory]);

  // 执行全局撤销操作
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoingRef.current = true; // 标记为撤销操作
      
      // 清除任何待处理的历史添加
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setHistoryIndex(historyIndex - 1);
      const previousText = history[historyIndex - 1];
      setOutline(previousText);
      pendingTextRef.current = previousText;
      
      // 重置标记
      setTimeout(() => {
        isUndoingRef.current = false;
      }, 50);
    }
  }, [historyIndex, history]);

  // 执行全局重做操作
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoingRef.current = true; // 标记为重做操作
      
      // 清除任何待处理的历史添加
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setHistoryIndex(historyIndex + 1);
      const nextText = history[historyIndex + 1];
      setOutline(nextText);
      pendingTextRef.current = nextText;
      
      // 重置标记
      setTimeout(() => {
        isUndoingRef.current = false;
      }, 50);
    }
  }, [historyIndex, history]);
  
  // 针对特定节点的撤销/重做操作
  const handleNodeOperation = useCallback((nodeId, operation) => {
    isUndoingRef.current = true; // 标记为节点操作
    
    // 获取节点在大纲中的索引和内容
    const { nodes: currentNodes } = processOutlineToNodesEdges(outline);
    const targetNode = currentNodes.find(node => node.id === nodeId);
    
    if (!targetNode) {
      isUndoingRef.current = false;
      return;
    }
    
    // 将大纲分割成行
    const lines = outline.split('\n');
    const nodeIndex = parseInt(nodeId.split('-')[1]);
    
    if (isNaN(nodeIndex) || nodeIndex >= lines.length) {
      isUndoingRef.current = false;
      return;
    }
    
    let newOutline = outline;
    
    if (operation === 'undo' && historyIndex > 0) {
      // 在历史记录中找到该节点之前的状态
      const prevOutlineLines = history[historyIndex - 1].split('\n');
      if (nodeIndex < prevOutlineLines.length) {
        lines[nodeIndex] = prevOutlineLines[nodeIndex];
        newOutline = lines.join('\n');
      }
    } else if (operation === 'redo' && historyIndex < history.length - 1) {
      // 在历史记录中找到该节点之后的状态
      const nextOutlineLines = history[historyIndex + 1].split('\n');
      if (nodeIndex < nextOutlineLines.length) {
        lines[nodeIndex] = nextOutlineLines[nodeIndex];
        newOutline = lines.join('\n');
      }
    }
    
    if (newOutline !== outline) {
      setOutline(newOutline);
      // 立即添加到历史记录（不延迟）
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newOutline);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      pendingTextRef.current = newOutline;
    }
    
    // 重置标记
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 50);
  }, [outline, history, historyIndex]);

  // 当大纲文本改变时，更新节点和边
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = processOutlineToNodesEdges(outline);
    
    // 为每个节点添加操作回调和类型
    const nodesWithCallbacks = newNodes.map(node => ({
      ...node,
      type: 'customNode',
      data: {
        ...node.data,
        onNodeOperation: handleNodeOperation
      }
    }));
    
    // 确保边有明确的视觉样式
    const enhancedEdges = newEdges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#333', 
        strokeWidth: 2,
        visibility: 'visible'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: '#333',
      }
    }));
    
    setNodes(nodesWithCallbacks);
    setEdges(enhancedEdges);
  }, [outline, handleNodeOperation]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="mind-map-editor">
      <div className="editor-panel">
        <OutlineEditor
          value={outline}
          onChange={handleOutlineChange}
        />
        <UndoRedoPanel
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>
      <div className="flow-panel">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#333', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#333'
            }
          }}
          elementsSelectable={true}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default MindMapEditor;