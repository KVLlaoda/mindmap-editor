// src/App.js
import React from 'react';
import MindMapEditor from './components/MindMapEditor';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>思维导图编辑器</h1>
        <div className="app-description">
          轻松创建和编辑思维导图，支持大纲编辑和节点级操作
        </div>
      </header>
      <main>
        <MindMapEditor />
      </main>
    </div>
  );
}

export default App;