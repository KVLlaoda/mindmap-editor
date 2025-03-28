// src/utils/outlineProcessor.js
import _ from 'lodash';

// 将大纲文本处理成树状结构
export const processOutlineToTree = (outlineText) => {
  const lines = outlineText.split('\n');
  const root = { id: 'root', label: '', children: [], level: -1 };
  const stack = [root];

  lines.forEach((line, index) => {
    if (!line.trim()) return; // 跳过空行
    
    // 计算当前行的缩进级别（Tab数量）
    const tabCount = line.match(/^\t*/)[0].length;
    const trimmedLine = line.trim();
    
    // 创建当前节点
    const node = {
      id: `node-${index}`,
      label: trimmedLine,
      children: [],
      level: tabCount
    };
    
    // 查找父节点
    while (stack.length > 1 && stack[stack.length - 1].level >= tabCount) {
      stack.pop();
    }
    
    // 添加到父节点的子节点列表
    const parent = stack[stack.length - 1];
    parent.children.push(node);
    
    // 将当前节点压入堆栈，以便后续处理其子节点
    stack.push(node);
  });
  
  return root.children[0] || { id: 'empty', label: '暂无内容', children: [] };
};

// 布局算法：计算每个节点的位置
const calculateNodePositions = (node, x = 0, y = 0, horizontalSpacing = 250, verticalSpacing = 120) => {
  // 固定位置
  node.position = { x, y };
  
  if (!node.children || node.children.length === 0) return;
  
  // 计算子节点的纵向位置范围
  const totalHeight = (node.children.length - 1) * verticalSpacing;
  let currentY = y - totalHeight / 2;
  
  node.children.forEach(child => {
    calculateNodePositions(
      child,
      x + horizontalSpacing,
      currentY,
      horizontalSpacing,
      verticalSpacing
    );
    currentY += verticalSpacing;
  });
};

// 计算文本的宽度
const calculateTextWidth = (text, fontSize = 14) => {
  // 每个字符的估计宽度（像素）
  const avgCharWidth = fontSize * 0.7;
  
  // 添加一些额外的padding
  const padding = 40;
  
  // 计算估计宽度
  return Math.max(120, text.length * avgCharWidth + padding);
};

// 将树状结构转换为ReactFlow所需的节点和边
export const processOutlineToNodesEdges = (outlineText) => {
  // 生成树
  const tree = processOutlineToTree(outlineText);
  
  // 计算节点位置
  calculateNodePositions(tree);
  
  // 收集所有节点
  const nodes = [];
  const edges = [];
  
  // 递归遍历树，生成节点和边
  const processNode = (node) => {
    // 根据文本内容计算节点宽度
    const nodeWidth = calculateTextWidth(node.label);
    
    // 添加节点，包含撤销/重做操作的按钮
    nodes.push({
      id: node.id,
      // 使用自定义节点数据，包含节点标签和ID
      data: { 
        label: node.label,
        nodeId: node.id
      },
      position: node.position,
      // 添加自定义类名以便定位节点操作按钮
      className: node.id === 'node-0' ? 'mindmap-node root-node' : 'mindmap-node',
      // 设置节点宽度以适应文本内容
      style: {
        width: nodeWidth,
      }
    });
    
    // 为每个子节点创建边
    node.children.forEach(child => {
      // 创建边，明确指定源和目标的连接点(handle)
      edges.push({
        id: `edge-${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        // 明确指定从源节点的右侧连接点到目标节点的顶部连接点
        sourceHandle: null, // 默认使用Right
        targetHandle: null, // 默认使用Top
        type: 'smoothstep', // 使用平滑的曲线
        style: {
          stroke: '#333',
          strokeWidth: 2
        }
      });
      
      // 递归处理子节点
      processNode(child);
    });
  };
  
  // 处理根节点
  processNode(tree);
  
  return { nodes, edges };
};