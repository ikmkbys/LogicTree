import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Move, Sparkles, LoaderCircle } from 'lucide-react';

// TreeNodeコンポーネント：ツリーの各ノードを描画
const TreeNode = ({ node, onAddChild, onDeleteNode, onEditText, isRoot, editingNodeId, setEditingNodeId, onDropNode, onExpandIdeas, loadingNodeId }) => {
  const isEditing = node.id === editingNodeId;
  const isLoading = node.id === loadingNodeId;
  const [editText, setEditText] = useState(node.text);
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setEditText(node.text);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditing, node.text]);

  const handleSave = () => {
    if (editText.trim()) {
      onEditText(node.id, editText);
    }
    setEditingNodeId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setEditText(node.text);
      setEditingNodeId(null);
    }
  };
  
  const handleDoubleClickEdit = () => {
      if(!isEditing && !isLoading) {
          setEditingNodeId(node.id);
      }
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/logic-tree-node-id", node.id);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData("application/logic-tree-node-id");
    if (draggedId && draggedId !== node.id) {
      onDropNode(draggedId, node.id);
    }
  };

  return (
    <div className="flex items-start relative">
      {/* 接続線を実線に変更 */}
      {!isRoot && (
        <div className="absolute top-0 left-[-3.5rem] h-full">
            {/* Horizontal solid line */}
            <div className="absolute top-1/2 -translate-y-px w-14 h-px bg-slate-300"></div>
            {/* Vertical solid line */}
            <div className="absolute top-0 w-px h-full bg-slate-300"></div>
        </div>
      )}

      <div 
        className={`flex flex-col items-start transition-all duration-300 ${isDragOver ? 'bg-blue-100/50 rounded-xl p-2' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
            className="relative group bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-lg p-4 min-w-[240px] transition-all duration-300 hover:shadow-xl hover:border-blue-300"
            onDoubleClick={handleDoubleClickEdit}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
              <LoaderCircle className="animate-spin text-blue-500" />
            </div>
          )}
          {isEditing ? (
              <div className="flex items-center flex-grow">
                <input
                  ref={inputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="w-full text-slate-800 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
                <button onClick={handleSave} className="ml-2 p-1 text-slate-500 hover:text-green-600 transition-colors"><Save size={18} /></button>
              </div>
            ) : (
            <div 
                draggable={!isLoading} 
                onDragStart={handleDragStart}
                className={`flex items-center ${isLoading ? 'cursor-not-allowed' : ''}`}
            >
                {!isRoot && <Move size={16} className={`mr-3 text-slate-400 flex-shrink-0 ${isLoading ? '' : 'cursor-move'}`} />}
                <p className="text-slate-800 font-medium break-words flex-grow cursor-pointer">{node.text}</p>
            </div>
            )}
          {/* ボタンのデザインを変更 */}
          <div className="absolute top-1/2 -right-5 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-90">
            <button onClick={() => onExpandIdeas(node.id)} className="bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 transition-all hover:scale-110" title="✨ AIでアイデアを広げる">
              <Sparkles size={16} />
            </button>
            <button onClick={() => onAddChild(node.id)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110" title="子要素を追加">
              <Plus size={16} />
            </button>
            {!isRoot && <button onClick={() => onDeleteNode(node.id)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110" title="削除"><Trash2 size={16} /></button>}
          </div>
        </div>
        
        {/* 子ノードとの間隔を調整 */}
        {node.children && node.children.length > 0 && (
          <div className="pt-10 pl-24 flex flex-col gap-10">
            {node.children.map(child => (
              <TreeNode 
                key={child.id} 
                node={child} 
                onAddChild={onAddChild} 
                onDeleteNode={onDeleteNode}
                onEditText={onEditText}
                isRoot={false}
                editingNodeId={editingNodeId}
                setEditingNodeId={setEditingNodeId}
                onDropNode={onDropNode}
                onExpandIdeas={onExpandIdeas}
                loadingNodeId={loadingNodeId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// メインのAppコンポーネント
export default function App() {
  const [treeData, setTreeData] = useState({
    id: 'root',
    text: '会社の売上を向上させる',
    children: [],
  });
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [loadingNodeId, setLoadingNodeId] = useState(null);
  const [error, setError] = useState(null);

  const handleAddChild = useCallback((parentId) => {
    const newId = `node-${Date.now()}`;
    const newNode = { id: newId, text: '新しい要素', children: [] };
    setTreeData(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        const addAction = (node) => { node.children.push(newNode); return node; };
        return traverseTree(newTree, parentId, addAction);
    });
    setEditingNodeId(newId);
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
      setTreeData(prevTree => {
        let newTree = JSON.parse(JSON.stringify(prevTree));
        function findAndRemove(current, targetId) {
            if (current.children) {
                current.children = current.children.filter(child => child.id !== targetId);
                current.children.forEach(child => findAndRemove(child, targetId));
            }
            return current;
        }
        return findAndRemove(newTree, nodeId);
    });
    if (editingNodeId === nodeId) setEditingNodeId(null);
  }, [editingNodeId]);
  
  const handleEditText = useCallback((nodeId, newText) => {
      setTreeData(prevTree => {
        let newTree = JSON.parse(JSON.stringify(prevTree));
        const editAction = (node) => { node.text = newText; return node; };
        return traverseTree(newTree, nodeId, editAction);
    });
  }, []);

  const handleDropNode = useCallback((draggedId, targetId) => {
    setTreeData(currentTree => {
      let draggedNode = null;
      let newTree = JSON.parse(JSON.stringify(currentTree));
      function isDescendant(node, id) {
        if (node.id === id) return true;
        return node.children?.some(child => isDescendant(child, id)) ?? false;
      }
      function findAndRemove(node, idToRemove) {
        if (!node.children) return;
        const childIndex = node.children.findIndex(child => child.id === idToRemove);
        if (childIndex > -1) {
          draggedNode = node.children.splice(childIndex, 1)[0];
        } else {
          node.children.forEach(child => findAndRemove(child, idToRemove));
        }
      }
      findAndRemove(newTree, draggedId);
      function findAndAdd(node, idToFind) {
        if (node.id === idToFind) {
          if (draggedNode && !isDescendant(draggedNode, idToFind)) {
              if (!node.children) node.children = [];
              node.children.push(draggedNode);
              return true; // 成功
          }
          return false; // 失敗
        }
        return node.children?.some(child => findAndAdd(child, idToFind)) ?? false;
      }
      if(draggedNode && findAndAdd(newTree, targetId)){
        return newTree;
      }
      return currentTree;
    });
  }, []);

  const handleExpandIdeas = useCallback(async (nodeId) => {
    setLoadingNodeId(nodeId);
    setError(null);
    
    let nodeText = '';
    const findNodeText = (node, id) => {
      if (node.id === id) {
        nodeText = node.text;
        return;
      }
      if (node.children) {
        node.children.forEach(child => findNodeText(child, id));
      }
    };
    findNodeText(treeData, nodeId);

    if (!nodeText) {
      setError("ノードが見つかりませんでした。");
      setLoadingNodeId(null);
      return;
    }

    const prompt = `「${nodeText}」というトピックを、より具体的な要素に分解してください。分解した要素を3つから5つ、JSON配列の形式で、["要素1", "要素2", ...] のように日本語で回答してください。`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      }
    };

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
        const ideas = JSON.parse(result.candidates[0].content.parts[0].text);
        
        if (Array.isArray(ideas)) {
          const newNodes = ideas.map(idea => ({
            id: `node-${Date.now()}-${Math.random()}`,
            text: idea,
            children: []
          }));

          setTreeData(prevTree => {
            let newTree = JSON.parse(JSON.stringify(prevTree));
            const addAction = (node) => {
              node.children.push(...newNodes);
              return node;
            };
            return traverseTree(newTree, nodeId, addAction);
          });
        }
      } else {
        throw new Error("AIから有効な回答が得られませんでした。");
      }
    } catch (err) {
      console.error(err);
      setError("アイデアの生成中にエラーが発生しました。");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingNodeId(null);
    }
  }, [treeData]);
  
  const traverseTree = (node, nodeId, action) => {
    if (node.id === nodeId) {
      action(node);
      return node;
    }
    if (node.children) {
      node.children = node.children.map(child => traverseTree(child, nodeId, action));
    }
    return node;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen font-sans p-4 sm:p-8">
       {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
              AI Logic Tree
            </h1>
            <p className="text-slate-500 mt-2">課題を分解し、AIと一緒に根本原因や解決策を考えましょう。</p>
        </header>
        <main className="flex justify-start p-4">
          <div className="p-4 overflow-x-auto">
            {treeData && <TreeNode 
              node={treeData} 
              onAddChild={handleAddChild} 
              onDeleteNode={handleDeleteNode}
              onEditText={handleEditText}
              isRoot={true}
              editingNodeId={editingNodeId}
              setEditingNodeId={setEditingNodeId}
              onDropNode={handleDropNode}
              onExpandIdeas={handleExpandIdeas}
              loadingNodeId={loadingNodeId}
            />}
          </div>
        </main>
      </div>
    </div>
  );
}
