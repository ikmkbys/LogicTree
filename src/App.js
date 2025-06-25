import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Move, Sparkles, LoaderCircle, RefreshCw, Download, Upload, HelpCircle } from 'lucide-react';

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
      {!isRoot && (
        <div className="absolute top-0 left-[-3.5rem] h-full">
            <div className="absolute top-1/2 -translate-y-px w-14 h-px bg-slate-300"></div>
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
          <div className="absolute top-1/2 -right-5 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-90">
            <button onClick={() => onExpandIdeas(node.id)} className="bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 transition-all hover:scale-110" title="✨ AIでアイデアを洗い替え">
              <Sparkles size={16} />
            </button>
            <button onClick={() => onAddChild(node.id)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110" title="子要素を追加">
              <Plus size={16} />
            </button>
            {!isRoot && <button onClick={() => onDeleteNode(node.id)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110" title="削除"><Trash2 size={16} /></button>}
          </div>
        </div>
        
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

const initialTree = {
  id: 'root',
  text: '会社の売上を向上させる',
  children: [],
  source: 'manual',
};

// メインのAppコンポーネント
export default function App() {
  const [treeData, setTreeData] = useState(JSON.parse(JSON.stringify(initialTree)));
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [loadingNodeId, setLoadingNodeId] = useState(null);
  const [error, setError] = useState(null);
  const importFileRef = useRef(null);

  const handleReset = () => {
    setTreeData(JSON.parse(JSON.stringify(initialTree)));
  };

  const handleExportCSV = () => {
    const rows = [];
    let maxDepth = 0;

    const traverse = (node, depth = 0) => {
        if (depth > maxDepth) maxDepth = depth;
        const row = new Array(depth).fill('');
        row.push(node.text);
        rows.push(row);
        if (node.children) node.children.forEach(child => traverse(child, depth + 1));
    };
    traverse(treeData);

    const header = Array.from({ length: maxDepth + 1 }, (_, i) => `レベル ${i + 1}`).join(',');
    const csvString = rows.map(row => {
        const fullRow = [...row];
        while (fullRow.length <= maxDepth) fullRow.push('');
        return fullRow.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    const csvContent = `${header}\n${csvString}`;
    
    // ファイル名生成ロジック
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${yy}${mm}${dd}`;
    const filename = `${treeData.text}_${formattedDate}.csv`;

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // Excelでの文字化け防止
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    importFileRef.current.click();
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("無効なCSVファイルです。");

            const dataRows = lines.slice(1); // ヘッダーを除外
            let newTree = null;
            const parentStack = [];

            dataRows.forEach((row, index) => {
                // 正規表現でCSV行をパース
                const cells = (row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []).map(cell => cell.replace(/^"|"$/g, ''));
                
                const depth = cells.findIndex(cell => cell.trim() !== '');
                if (depth === -1) return;

                const text = cells[depth];
                const newNode = {
                    id: `imported-${Date.now()}-${index}`,
                    text: text,
                    children: [],
                    source: 'manual', // インポートされたノードは手動扱い
                };

                if (depth === 0) {
                    newTree = newNode;
                    parentStack[0] = newNode;
                } else {
                    const parent = parentStack[depth - 1];
                    if (!parent) throw new Error(`CSVの構造が不正です (行: ${index + 2})`);
                    parent.children.push(newNode);
                    parentStack[depth] = newNode;
                }
                parentStack.length = depth + 1;
            });
            
            if (newTree) {
                setTreeData(newTree);
            } else {
                throw new Error("CSVからツリーを構築できませんでした。");
            }

        } catch (err) {
            console.error(err);
            setError("CSVの読み込みに失敗しました。フォーマットを確認してください。");
            setTimeout(() => setError(null), 5000);
        } finally {
           // 同じファイルを再度選択できるようにする
           event.target.value = null;
        }
    };
    reader.readAsText(file);
  };

  const handleAddChild = useCallback((parentId) => {
    const newId = `node-${Date.now()}`;
    const newNode = { id: newId, text: '新しい要素', children: [], source: 'manual' }; // 手動追加の印
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

  const handleDropNode = useCallback((draggedId, dropTargetId) => {
    setTreeData(currentTree => {
        const newTree = JSON.parse(JSON.stringify(currentTree));

        let draggedNodeInfo = null;
        let dropTargetInfo = null;

        function findNodeWithParent(node, id, parent = null) {
            if (node.id === id) {
                return { node, parent };
            }
            if (node.children) {
                for (const child of node.children) {
                    const found = findNodeWithParent(child, id, node);
                    if (found) return found;
                }
            }
            return null;
        }

        draggedNodeInfo = findNodeWithParent(newTree, draggedId);
        dropTargetInfo = findNodeWithParent(newTree, dropTargetId);

        if (!draggedNodeInfo || !dropTargetInfo || draggedId === dropTargetId) {
            return currentTree;
        }
        
        const { node: draggedNode, parent: draggedParent } = draggedNodeInfo;
        const { node: dropTargetNode, parent: dropTargetParent } = dropTargetInfo;

        function isDescendant(node, id) {
            return node.id === id || (node.children && node.children.some(child => isDescendant(child, id)));
        }

        if (isDescendant(draggedNode, dropTargetId)) {
            return currentTree;
        }

        // Case 1: 兄弟間の移動
        if (draggedParent && dropTargetParent && draggedParent.id === dropTargetParent.id) {
            const siblings = draggedParent.children;
            const originalIndex = siblings.findIndex(c => c.id === draggedId);
            const targetIndex = siblings.findIndex(c => c.id === dropTargetId);

            // 1. 元の場所から削除
            const [removedNode] = siblings.splice(originalIndex, 1);

            // 2. 新しい位置に挿入
            // `splice`で`originalIndex`が削除された後の配列に対して挿入位置を計算
            const newTargetIndex = siblings.findIndex(c => c.id === dropTargetId);
            
            if (originalIndex < targetIndex) {
                 // 下に移動した場合、ターゲットの後ろに挿入
                 siblings.splice(newTargetIndex + 1, 0, removedNode);
            } else {
                // 上に移動した場合、ターゲットの前に挿入
                siblings.splice(newTargetIndex, 0, removedNode);
            }
        } else { // Case 2: 親子関係の変更
            // 元の場所から削除
            if (draggedParent) {
                draggedParent.children = draggedParent.children.filter(child => child.id !== draggedId);
            }
            // 新しい親の情報を再取得して追加
            const newDropTargetParent = findNodeWithParent(newTree, dropTargetId).node;
            if (!newDropTargetParent.children) {
                newDropTargetParent.children = [];
            }
            newDropTargetParent.children.push(draggedNode);
        }
        
        return newTree;
    });
  }, []);

  const handleExpandIdeas = useCallback(async (nodeId) => {
    setLoadingNodeId(nodeId);
    setError(null);

    let nodeText = '';
    const ancestorTexts = [];

    function findNodeAndAncestors(node, targetId, path = []) {
        const currentPath = [...path, node.text];
        if (node.id === targetId) {
            nodeText = node.text;
            ancestorTexts.push(...currentPath.slice(0, -1));
            return true;
        }
        if (node.children) {
            for (const child of node.children) {
                if (findNodeAndAncestors(child, targetId, currentPath)) {
                    return true;
                }
            }
        }
        return false;
    }

    findNodeAndAncestors(treeData, nodeId);
    
    if (!nodeText) {
      setError("ノードが見つかりませんでした。");
      setLoadingNodeId(null);
      return;
    }

    let prompt;
    if (ancestorTexts.length > 0) {
        prompt = `上位階層に「${ancestorTexts.join(' -> ')}」というトピックが存在する文脈で、「${nodeText}」というトピックを、より具体的な要素に分解してください。ただし、上位階層で既出のトピック（${ancestorTexts.join(', ')}）は提案に含めないでください。分解した要素を3つから5つ、JSON配列の形式で、["要素1", "要素2", ...] のように日本語で回答してください。`;
    } else {
        prompt = `「${nodeText}」というトピックを、より具体的な要素に分解してください。分解した要素を3つから5つ、JSON配列の形式で、["要素1", "要素2", ...] のように日本語で回答してください。`;
    }

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: { type: "ARRAY", items: { type: "STRING" } }
      }
    };

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      const result = await response.json();
      
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const ideas = JSON.parse(result.candidates[0].content.parts[0].text);
        if (Array.isArray(ideas)) {
          // AI生成の印
          const newNodes = ideas.map(idea => ({ id: `node-${Date.now()}-${Math.random()}`, text: idea, children: [], source: 'ai' }));
          setTreeData(prevTree => {
            let newTree = JSON.parse(JSON.stringify(prevTree));
            const replaceAiAction = (node) => {
              // 既存のAI生成ノードをフィルタリングし、手動ノードは残す
              const manualChildren = node.children.filter(child => child.source !== 'ai');
              // 手動ノードと新しいAIノードを結合
              node.children = [...manualChildren, ...newNodes];
              return node;
            };
            return traverseTree(newTree, nodeId, replaceAiAction);
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
    if (node.children) node.children = node.children.map(child => traverseTree(child, nodeId, action));
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
        <header className="mb-12">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                  AI Logic Tree
                </h1>
                <p className="text-slate-500 mt-2">課題を分解し、AIと一緒に根本原因や解決策を考えましょう。</p>
            </div>
            <div className="flex justify-center gap-4 mt-6 flex-wrap">
                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <RefreshCw size={16} />
                    リセット
                </button>
                <input type="file" accept=".csv" ref={importFileRef} onChange={handleFileImport} style={{ display: 'none' }} />
                <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload size={16} />
                    CSVインポート
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-500 border border-blue-500 rounded-lg shadow-sm text-white hover:bg-blue-600 transition-colors">
                    <Download size={16} />
                    CSVエクスポート
                </button>
                <a href="help.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <HelpCircle size={16} />
                    ヘルプ
                </a>
            </div>
        </header>
        <main className="flex justify-start p-4">
          <div className="p-4">
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
