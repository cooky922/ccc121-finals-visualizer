import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Trash2, ArrowRight, ArrowDown, ChevronDown, ChevronRight, 
  Play, SkipForward, ZoomIn, ZoomOut, Maximize, HelpCircle, 
  X, Network } from 'lucide-react';
import './index.css';

// Custom Hook for Step-by-Step Animation
const useStepper = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const resolver = useRef(null);
  const isSkipping = useRef(false);

  const startAnimation = () => {
    setIsAnimating(true);
    isSkipping.current = false;
    setWaiting(false);
  };

  const endAnimation = () => {
    setIsAnimating(false);
    isSkipping.current = false;
    setWaiting(false);
    if (resolver.current) {
      resolver.current();
      resolver.current = null;
    }
  };

  const step = async () => {
    if (isSkipping.current) return;
    setWaiting(true);
    await new Promise(r => { resolver.current = r; });
    setWaiting(false);
  };

  const nextStep = () => {
    if (resolver.current) {
      resolver.current();
      resolver.current = null;
    }
  };

  const skipToEnd = () => {
    isSkipping.current = true;
    nextStep();
  };

  return { 
    isAnimating, 
    waiting, 
    startAnimation, 
    endAnimation, 
    step, 
    nextStep, 
    skipToEnd 
  };
};

const App = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [showSyntax, setShowSyntax] = useState(false);

  // Syntax help per tab
  const syntaxMap = {
    queue: ["enqueue [values]...", "dequeue", "peek_front", "peek_rear", "clear"],
    bst: ["insert [values]...", "search [value]", "peek_min", "peek_max", "remove [value]", "clear", "preorder", "inorder", "postorder", "levelorder"],
    heap: ["create [values]...", "insert [values]...", "peek_max", "remove_max", "clear", "preorder", "inorder", "postorder", "levelorder"]
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 font-sans selection:bg-blue-200 flex flex-col overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        body, .font-sans {
          font-family: 'Google Sans', sans-serif;
        }
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        /* Glass Effect Utilities */
        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        
        .glass-header {
          background: rgba(30, 58, 138, 0.95); /* Darker Blue */
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
      
      {/* Header */}
      <header className="glass-header border-b border-blue-900/50 shrink-0 z-50 shadow-lg relative text-white">
        <div className="w-full h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
              <Network size={20} className="text-blue-100" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
              CCC121 Visualizer
            </h1>
          </div>
          
          <nav className="absolute left-1/2 -translate-x-1/2 flex gap-1 bg-blue-950/40 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
            {[
              { id: 'queue', label: 'Queue' },
              { id: 'bst', label: 'Binary Search Tree' },
              { id: 'heap', label: 'Max Heap' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-900 shadow-md font-bold'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => setShowSyntax(!showSyntax)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${showSyntax ? 'bg-white text-blue-900 border-white' : 'bg-transparent text-white border-white/20 hover:bg-white/10'}`}
          >
            <HelpCircle size={16} /> Syntax
          </button>
        </div>

        {/* Syntax Dropdown Overlay */}
        {showSyntax && (
          <div className="absolute right-4 top-16 w-72 glass-panel rounded-xl p-4 animate-in fade-in slide-in-from-top-2 z-50">
            <div className="flex justify-between items-center mb-3 border-b border-slate-200/50 pb-2">
              <h3 className="font-bold text-slate-700 text-sm">Commands</h3>
              <button onClick={() => setShowSyntax(false)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
            </div>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {syntaxMap[activeTab].map((cmd, i) => (
                <div key={i} className="text-xs font-mono text-slate-600 bg-white/50 p-1.5 rounded border border-slate-100 shadow-sm">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden p-4">
        <div className={`w-full h-full ${activeTab === 'queue' ? 'block' : 'hidden'}`}>
          <QueueVisualizer />
        </div>
        <div className={`w-full h-full ${activeTab === 'bst' ? 'block' : 'hidden'}`}>
          <BSTVisualizer />
        </div>
        <div className={`w-full h-full ${activeTab === 'heap' ? 'block' : 'hidden'}`}>
          <HeapVisualizer />
        </div>
      </main>
    </div>
  );
};

// ==========================================
// RESIZABLE LAYOUT COMPONENT
// ==========================================

const VisualizerLayout = ({ logs, setLogs, onCommand, stepper, children, controls, statusData }) => {
  const [input, setInput] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(50); 
  const [isResizing, setIsResizing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { isAnimating, waiting, nextStep, skipToEnd } = stepper || { isAnimating: false };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isAnimating) return;
    await onCommand(input.trim());
    setInput('');
  };

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  
  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  // Keyboard Controls: Space (Next), Enter (Skip)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAnimating) return;
      
      if (e.code === 'Space') {
        e.preventDefault(); 
        nextStep();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        skipToEnd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, nextStep, skipToEnd]);

  // Zoom Handler
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.002;
        setZoom(prev => Math.min(Math.max(0.1, prev + delta), 5));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleFitToScreen = () => {
    setZoom(1);
    if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        el.scrollTo({ top: 0, left: (el.scrollWidth - el.clientWidth) / 2, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const zoomControls = (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20 pointer-events-auto">
      {controls}
      <div className="glass-panel p-1 rounded-lg flex flex-col gap-1">
         <button onClick={() => setZoom(z => Math.min(z + 0.2, 5))} className="p-2 hover:bg-white/50 rounded-md text-slate-600 transition-colors" title="Zoom In"><ZoomIn size={18}/></button>
         <button onClick={handleFitToScreen} className="p-2 hover:bg-white/50 rounded-md text-slate-600 transition-colors" title="Fit to Screen"><Maximize size={18}/></button>
         <button onClick={() => setZoom(z => Math.max(0.1, z - 0.2))} className="p-2 hover:bg-white/50 rounded-md text-slate-600 transition-colors" title="Zoom Out"><ZoomOut size={18}/></button>
      </div>
    </div>
  );

  const animationControls = isAnimating && (
    <div className="absolute bottom-4 left-4 glass-panel p-2 rounded-lg flex gap-2 animate-in fade-in zoom-in z-20 pointer-events-auto">
      <button
        onClick={nextStep}
        disabled={!waiting}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all shadow-sm ${
          waiting 
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95' 
            : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
        }`}
        title="Press Space"
      >
        <Play size={14} fill="currentColor" /> Next (Space)
      </button>
      <button
        onClick={skipToEnd}
        className="px-4 py-2 rounded-md bg-white/50 border border-slate-200/50 text-slate-600 text-xs font-bold hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-2 shadow-sm"
        title="Press Enter"
      >
        <SkipForward size={14} /> Skip (Enter)
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col lg:flex-row h-full w-full gap-4 ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      {/* Left Panel */}
      <div 
        className="flex flex-col h-[45vh] lg:h-full min-w-[300px] gap-4"
        style={{ width: window.innerWidth >= 1024 ? `${sidebarWidth}%` : '100%' }}
      >
        {/* Top Half: Command Input & Output View (50% of left panel) */}
        <div className="glass-panel p-4 rounded-2xl flex-1 min-h-0 flex flex-col gap-3">
          {/* Input Area */}
          <form onSubmit={handleSubmit} className="relative z-0 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAnimating ? "Animation running..." : "Enter command..."}
              disabled={isAnimating}
              className="w-full bg-white/50 border border-slate-200/60 rounded-xl py-2.5 pl-4 pr-12 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:bg-slate-50/50 disabled:text-slate-400 transition-all placeholder:text-slate-400 shadow-inner"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={isAnimating}
              className="absolute right-2 top-0 bottom-0 my-auto h-8 w-8 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Output View (Takes remaining space of top half) */}
          <div className="flex-1 min-h-0 flex flex-col">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Output View</div>
             <div className="bg-white/40 rounded-xl border border-white/60 p-3 flex-1 overflow-y-auto custom-scrollbar shadow-inner">
                {statusData ? (
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-500">{statusData.label}:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {(statusData.type === 'single' ? [statusData.value] : statusData.items).map((item, i) => (
                                <span key={i} className={`px-2.5 py-1 text-xs font-mono rounded-md border ${
                                    (statusData.type === 'single' || i === statusData.activeIndex)
                                    ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md scale-105' 
                                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                                } transition-all duration-200`}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 italic text-xs">
                        No active output
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Bottom Half: Console Log (50% of left panel) */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Console Log</span>
            <button 
              onClick={() => setLogs([])} 
              className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-white/5"
              title="Clear Log"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
              <span className="text-slate-600 italic text-xs font-mono pl-1">Ready...</span>
            ) : (
              logs.map((entry, i) => (
                <div key={i} className={`font-mono border-l-2 pl-3 py-1 text-xs leading-relaxed rounded-r-md animate-in slide-in-from-left-2 ${entry.type === 'error' ? 'border-red-500 text-red-200 bg-red-500/10' : entry.type === 'success' ? 'border-green-500 text-green-200 bg-green-500/10' : 'border-blue-500 text-slate-300'}`}>
                  {entry.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div 
        onMouseDown={startResizing}
        className="hidden lg:flex w-2 -ml-3 -mr-3 cursor-col-resize items-center justify-center z-30 group"
      >
        <div className="w-1 h-12 bg-slate-300/50 rounded-full group-hover:bg-blue-400 transition-colors backdrop-blur-sm" />
      </div>

      {/* Right Panel: Canvas */}
      <div className="flex-1 h-[55vh] lg:h-full">
        <div 
            ref={canvasRef}
            className="glass-panel rounded-2xl w-full h-full relative overflow-hidden flex flex-col"
        >
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
          
          {zoomControls}
          {animationControls}

          <div 
            ref={scrollContainerRef}
            className="relative z-0 flex-1 overflow-auto custom-scrollbar flex items-start justify-center p-10"
          >
            <div className="min-h-full min-w-full flex items-center justify-center">
                <div 
                    className="transition-transform duration-200 ease-out"
                    style={{ 
                        transform: `scale(${zoom})`, 
                        transformOrigin: 'top center' 
                    }}
                >
                    {children}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// QUEUE IMPLEMENTATION
// ==========================================

const QueueVisualizer = () => {
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(null);
  const [highlightColor, setHighlightColor] = useState('gray'); 
  const [statusData, setStatusData] = useState(null);
  const stepper = useStepper();
  const { startAnimation, endAnimation, step } = stepper;

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ msg, time, type }, ...prev]);
  };

  const processCommand = async (cmdStr) => {
    const parts = cmdStr.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).map(arg => parseInt(arg)).filter(n => !isNaN(n));

    setHighlightIdx(null);
    setHighlightColor('gray');
    setStatusData(null);
    startAnimation();

    try {
        switch (command) {
        case 'enqueue':
            if (args.length === 0) {
                addLog("Usage: enqueue [values]...", 'error');
            } else {
                let currentQ = [...queue];
                setStatusData({ label: 'Inserting', items: args, activeIndex: -1, type: 'array' });
                for (let i = 0; i < args.length; i++) {
                    const val = args[i];
                    setStatusData({ label: 'Inserting', items: args, activeIndex: i, type: 'array' });
                    currentQ.push(val);
                    setQueue([...currentQ]);
                    setHighlightIdx(currentQ.length - 1);
                    setHighlightColor('blue');
                    addLog(`Enqueued: ${val}`, 'success');
                    await step();
                }
                setHighlightIdx(null);
            }
            break;
        case 'dequeue':
            if (queue.length === 0) {
                addLog("Queue is empty", 'error');
            } else {
                setHighlightIdx(0);
                setHighlightColor('red');
                await step();
                
                const [removed, ...rest] = queue;
                setQueue(rest);
                setHighlightIdx(null);
                addLog(`Dequeued: ${removed}`, 'success');
                setStatusData({ label: 'Dequeued', value: removed, type: 'single' });
                await step();
            }
            break;
        case 'peek_front':
            if (queue.length === 0) {
                addLog("Queue empty", 'error');
            } else {
                setHighlightIdx(0);
                setHighlightColor('green');
                addLog(`Front: ${queue[0]}`);
                setStatusData({ label: 'Peek Front', value: queue[0], type: 'single' });
                await step();
                setHighlightIdx(null);
            }
            break;
        case 'peek_rear':
            if (queue.length === 0) {
                addLog("Queue empty", 'error');
            } else {
                setHighlightIdx(queue.length - 1);
                setHighlightColor('green');
                addLog(`Rear: ${queue[queue.length - 1]}`);
                setStatusData({ label: 'Peek Rear', value: queue[queue.length - 1], type: 'single' });
                await step();
                setHighlightIdx(null);
            }
            break;
        case 'clear':
            setQueue([]);
            addLog("Cleared", 'success');
            break;
        default:
            addLog(`Unknown: ${command}`, 'error');
        }
    } catch(e) {
        console.error(e);
    } finally {
        endAnimation();
        setHighlightIdx(null);
        setHighlightColor('gray');
        setStatusData(null);
    }
  };

  return (
    <VisualizerLayout logs={logs} setLogs={setLogs} onCommand={processCommand} stepper={stepper} statusData={statusData}>
      <div className="flex flex-col items-center justify-center min-h-full w-full">
        {queue.length === 0 ? (
          <div className="text-slate-400 text-lg font-light text-center">Queue is empty</div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Front</div>
            {queue.map((item, idx) => {
                const isHighlighted = idx === highlightIdx;
                const borderColor = isHighlighted 
                    ? (highlightColor === 'red' ? 'border-red-500 bg-red-50' : highlightColor === 'green' ? 'border-green-500 bg-green-50' : highlightColor === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-slate-400')
                    : 'border-slate-400 bg-white';
                
                return (
                  <div key={idx} className="flex flex-col items-center animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
                    <div className="relative group">
                      <div className={`w-16 h-12 flex items-center justify-center border-2 rounded-lg shadow-sm text-base font-bold text-slate-700 relative z-10 transition-colors duration-300 ${borderColor}`}>
                        {item}
                      </div>
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono">{idx}</div>
                    </div>
                    {idx !== queue.length - 1 && (
                      <ArrowDown className="text-slate-300 my-1" size={16} />
                    )}
                  </div>
                );
            })}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Rear</div>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

// ==========================================
// BST IMPLEMENTATION
// ==========================================

class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

const BSTVisualizer = () => {
  const [root, setRoot] = useState(null);
  const [logs, setLogs] = useState([]);
  const [highlightIds, setHighlightIds] = useState([]);
  const [highlightColor, setHighlightColor] = useState('orange');
  const [statusData, setStatusData] = useState(null); 
  const stepper = useStepper();
  const { startAnimation, endAnimation, step } = stepper;

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ msg, time, type }, ...prev]);
  };

  const cloneTree = (node) => {
    if (!node) return null;
    const newNode = new BSTNode(node.value);
    newNode.id = node.id;
    newNode.left = cloneTree(node.left);
    newNode.right = cloneTree(node.right);
    return newNode;
  };

  const insertNode = (node, value) => {
    if (!node) return new BSTNode(value);
    if (value < node.value) node.left = insertNode(node.left, value);
    else node.right = insertNode(node.right, value);
    return node;
  };

  function* getTraversalSteps(node, type) {
    if (!node) return;
    if (type === 'preorder') yield node;
    if (node.left) yield* getTraversalSteps(node.left, type);
    if (type === 'inorder') yield node;
    if (node.right) yield* getTraversalSteps(node.right, type);
    if (type === 'postorder') yield node;
  }

  const processCommand = async (cmdStr) => {
    const parts = cmdStr.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).map(arg => parseInt(arg)).filter(n => !isNaN(n));

    setHighlightIds([]);
    setHighlightColor('orange');
    setStatusData(null);
    startAnimation();

    try {
      switch (command) {
        case 'insert':
          if (args.length === 0) {
            addLog("Usage: insert [values]...", 'error');
            break;
          }
          let tempRoot = cloneTree(root);
          
          for (let i = 0; i < args.length; i++) {
             const val = args[i];
             setStatusData({ label: 'Inserting', items: args, activeIndex: i, type: 'array' });
             addLog(`Inserting ${val}...`);
             
             let curr = root; 
             while(curr) {
                setHighlightIds([curr.id]);
                setHighlightColor('orange');
                await step();
                if (val < curr.value) {
                   if (!curr.left) break;
                   curr = curr.left;
                } else {
                   if (!curr.right) break;
                   curr = curr.right;
                }
             }
             tempRoot = insertNode(tempRoot, val);
             setRoot(tempRoot);
             
             let newNode = tempRoot;
             while(newNode) {
                 if (val < newNode.value) {
                     if (newNode.left) newNode = newNode.left;
                     else break;
                 } else {
                     if (newNode.right) newNode = newNode.right;
                     else break;
                 }
             }
             
             if(newNode) {
                setHighlightIds([newNode.id]);
                setHighlightColor('blue');
             }
             await step();
          }
          setHighlightIds([]);
          addLog(`Inserted: ${args.join(', ')}`, 'success');
          break;

        case 'search':
          if (args.length === 0) break;
          const val = args[0];
          addLog(`Searching ${val}...`);
          let curr = root;
          let found = false;
          while(curr) {
            setHighlightIds([curr.id]);
            setHighlightColor('orange');
            await step();
            if (curr.value === val) {
              setHighlightColor('green');
              found = true;
              addLog(`Found ${val}!`, 'success');
              setStatusData({ label: 'Found', value: val, type: 'single' });
              await step();
              break;
            } else if (val < curr.value) curr = curr.left;
            else curr = curr.right;
          }
          if (!found) {
            setHighlightColor('red');
            addLog(`${val} not found`, 'error');
            await step();
          }
          break;

        case 'remove':
           if (args.length === 0) break;
           const target = args[0];
           addLog(`Removing ${target}...`);
           let sNode = root;
           let sFound = false;
           while(sNode) {
              setHighlightIds([sNode.id]);
              setHighlightColor('orange');
              await step();
              if (sNode.value === target) {
                 sFound = true;
                 break;
              }
              if (target < sNode.value) sNode = sNode.left;
              else sNode = sNode.right;
           }

           if (sFound) {
              setHighlightColor('red'); 
              await step();

              let newRoot = cloneTree(root);
              const findNode = (n, v) => {
                  if(!n) return null;
                  if(n.value === v) return n;
                  if(v < n.value) return findNode(n.left, v);
                  return findNode(n.right, v);
              }
              let targetNode = findNode(newRoot, target);

              if (targetNode && targetNode.left && targetNode.right) {
                  let successor = targetNode.right;
                  while(successor.left) successor = successor.left;
                  
                  setHighlightIds([targetNode.id, successor.id]);
                  setHighlightColor('blue'); 
                  await step();
                  
                  let temp = targetNode.value;
                  targetNode.value = successor.value;
                  successor.value = temp;
                  setRoot({...newRoot});
                  await step();
                  
                  const removeRecursive = (n, v) => {
                      if (!n) return null;
                      if (v < n.value) { n.left = removeRecursive(n.left, v); return n; }
                      if (v > n.value) { n.right = removeRecursive(n.right, v); return n; }
                      if (n.value === v) {
                          if (!n.left) return n.right;
                          if (!n.right) return n.left;
                      }
                      return n;
                  }
                  targetNode.right = removeRecursive(targetNode.right, target);
              } else {
                   const removeSimple = (n, v) => {
                      if(!n) return null;
                      if(v < n.value) { n.left = removeSimple(n.left, v); return n; }
                      if(v > n.value) { n.right = removeSimple(n.right, v); return n; }
                      if(!n.left) return n.right;
                      if(!n.right) return n.left;
                      return n;
                   }
                   newRoot = removeSimple(newRoot, target);
              }

              setRoot(newRoot);
              setHighlightIds([]);
              addLog(`Removed ${target}`, 'success');
              setStatusData({ label: 'Removed', value: target, type: 'single' });
              await step();
           } else {
              setHighlightColor('red');
              addLog(`${target} not found`, 'error');
              await step();
           }
           break;

        case 'peek_min':
        case 'peek_max':
          if (!root) { addLog("Tree empty", 'error'); break; }
          let pNode = root;
          while(pNode) {
             setHighlightIds([pNode.id]);
             setHighlightColor('orange');
             await step();
             if (command === 'peek_min') {
               if (!pNode.left) { 
                   setHighlightColor('green'); 
                   addLog(`Min: ${pNode.value}`); 
                   setStatusData({ label: 'Min', value: pNode.value, type: 'single' });
                   break; 
               }
               pNode = pNode.left;
             } else {
               if (!pNode.right) { 
                   setHighlightColor('green'); 
                   addLog(`Max: ${pNode.value}`); 
                   setStatusData({ label: 'Max', value: pNode.value, type: 'single' });
                   break; 
               }
               pNode = pNode.right;
             }
          }
          await step();
          break;
        
        case 'clear':
          setRoot(null);
          addLog("Cleared", 'success');
          break;

        case 'preorder':
        case 'inorder':
        case 'postorder':
          if (!root) { addLog("Tree empty", 'error'); break; }
          addLog(`${command}...`);
          const steps = [...getTraversalSteps(root, command)];
          const visited = [];
          
          for (let node of steps) {
            setHighlightIds([node.id]);
            setHighlightColor('orange');
            visited.push(node.value);
            setStatusData({ label: 'Visited', items: visited, activeIndex: visited.length - 1, type: 'array' }); 
            await step();
          }
          addLog(`${command}: [${visited.join(', ')}]`, 'success');
          break;
        
        case 'levelorder':
           if (!root) { addLog("Tree empty", 'error'); break; }
           const queue = [root];
           const loVisited = [];
           while(queue.length) {
              const n = queue.shift();
              setHighlightIds([n.id]);
              setHighlightColor('orange');
              loVisited.push(n.value);
              setStatusData({ label: 'Visited', items: loVisited, activeIndex: loVisited.length - 1, type: 'array' });
              await step();
              if (n.left) queue.push(n.left);
              if (n.right) queue.push(n.right);
           }
           addLog(`levelorder: [${loVisited.join(', ')}]`, 'success');
           break;

        default:
          addLog(`Unknown: ${command}`, 'error');
      }
    } catch (e) {
      console.error(e);
      addLog("Error", 'error');
    } finally {
      endAnimation();
      setHighlightIds([]);
      setStatusData(null); 
    }
  };

  return (
    <VisualizerLayout logs={logs} setLogs={setLogs} onCommand={processCommand} stepper={stepper} statusData={statusData}>
      <div className="flex flex-col w-full h-full justify-center">
        {root ? (
           <TreeRenderer root={root} highlightIds={highlightIds} highlightColor={highlightColor} type="bst" />
        ) : (
          <div className="text-slate-400 text-lg font-light m-auto">Tree is empty</div>
        )}
      </div>
    </VisualizerLayout>
  );
};

// ==========================================
// HEAP IMPLEMENTATION
// ==========================================

const HeapVisualizer = () => {
  const [heap, setHeap] = useState([]);
  const [logs, setLogs] = useState([]);
  const [highlightIds, setHighlightIds] = useState([]);
  const [highlightColor, setHighlightColor] = useState('orange');
  const [statusData, setStatusData] = useState(null);
  const stepper = useStepper();
  const { startAnimation, endAnimation, step } = stepper;

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ msg, time, type }, ...prev]);
  };

  const processCommand = async (cmdStr) => {
    const parts = cmdStr.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).map(arg => parseInt(arg)).filter(n => !isNaN(n));

    setHighlightIds([]);
    setHighlightColor('orange');
    setStatusData(null);
    startAnimation();

    let currentHeap = [...heap];

    try {
      switch (command) {
        case 'create':
          if (args.length === 0) {
              setHeap([]);
              addLog("Created empty", 'success');
              break;
          }
          addLog(`Building heap...`);
          setHeap([...args]); 
          setStatusData({ label: 'Creating', items: args, activeIndex: -1, type: 'array' });
          await step();
          
          currentHeap = [...args];
          for (let i = Math.floor(currentHeap.length / 2) - 1; i >= 0; i--) {
             let parent = i;
             while (true) {
               let left = 2 * parent + 1;
               let right = 2 * parent + 2;
               let largest = parent;

               setHighlightIds([`heap-${parent}`]); 
               setHighlightColor('orange');
               await step();

               if (left < currentHeap.length && currentHeap[left] > currentHeap[largest]) largest = left;
               if (right < currentHeap.length && currentHeap[right] > currentHeap[largest]) largest = right;

               if (largest !== parent) {
                  setHighlightIds([`heap-${parent}`, `heap-${largest}`]);
                  setHighlightColor('blue'); // Swap 
                  await step();
                  
                  [currentHeap[parent], currentHeap[largest]] = [currentHeap[largest], currentHeap[parent]];
                  setHeap([...currentHeap]); 
                  setHighlightColor('green'); // Success
                  await step();
                  
                  parent = largest;
               } else {
                  break;
               }
             }
          }
          setStatusData({ label: 'Created Heap', items: currentHeap, activeIndex: -1, type: 'array' });
          addLog(`Created: [${currentHeap.join(', ')}]`, 'success');
          await step(); // Pause to show
          break;

        case 'insert':
          if (args.length === 0) break;
          
          for (let k = 0; k < args.length; k++) {
             const val = args[k];
             setStatusData({ label: 'Inserting', items: args, activeIndex: k, type: 'array' });
             addLog(`Inserting ${val}...`);
             
             currentHeap.push(val);
             setHeap([...currentHeap]); 
             
             let i = currentHeap.length - 1;
             setHighlightIds([`heap-${i}`]);
             setHighlightColor('blue'); // Inserted
             await step();

             while (i > 0) {
               let parent = Math.floor((i - 1) / 2);
               
               setHighlightIds([`heap-${i}`, `heap-${parent}`]);
               setHighlightColor('orange'); // Compare
               await step();

               if (currentHeap[i] > currentHeap[parent]) {
                  setHighlightColor('blue'); // Swap
                  await step();
                  
                  [currentHeap[i], currentHeap[parent]] = [currentHeap[parent], currentHeap[i]];
                  setHeap([...currentHeap]);
                  setHighlightColor('green'); // Success
                  await step();

                  i = parent;
               } else {
                  break;
               }
             }
          }
          setStatusData({ label: 'Result Heap', items: currentHeap, activeIndex: -1, type: 'array' });
          addLog(`Inserted: ${args.join(', ')}`, 'success');
          await step();
          break;

        case 'peek_max':
          if (currentHeap.length > 0) {
            setHighlightIds(['heap-0']);
            setHighlightColor('green');
            addLog(`Max: ${currentHeap[0]}`);
            setStatusData({ label: 'Max', value: currentHeap[0], type: 'single' });
            await step();
          } else {
            addLog("Heap empty", 'error');
          }
          break;

        case 'remove_max':
          if (currentHeap.length === 0) {
            addLog("Heap empty", 'error');
            break;
          }
          
          const max = currentHeap[0];
          addLog(`Removing Max (${max})...`);
          
          setHighlightIds(['heap-0']);
          setHighlightColor('red');
          await step();
          
          const lastIdx = currentHeap.length - 1;
          setHighlightIds(['heap-0', `heap-${lastIdx}`]);
          setHighlightColor('blue');
          await step();
          
          let temp = currentHeap[0];
          currentHeap[0] = currentHeap[lastIdx];
          currentHeap[lastIdx] = temp;
          setHeap([...currentHeap]);
          await step();

          const last = currentHeap.pop(); 
          setHeap([...currentHeap]);
          addLog("Sifting down...");
          
          if (currentHeap.length > 0) {
             let i = 0;
             while (true) {
                let l = 2 * i + 1;
                let r = 2 * i + 2;
                let largest = i;
                
                setHighlightIds([`heap-${i}`]);
                setHighlightColor('orange');
                await step();

                if (l < currentHeap.length && currentHeap[l] > currentHeap[largest]) largest = l;
                if (r < currentHeap.length && currentHeap[r] > currentHeap[largest]) largest = r;

                if (largest !== i) {
                   setHighlightIds([`heap-${i}`, `heap-${largest}`]);
                   setHighlightColor('blue');
                   await step();
                   
                   [currentHeap[i], currentHeap[largest]] = [currentHeap[largest], currentHeap[i]];
                   setHeap([...currentHeap]);
                   setHighlightColor('green');
                   await step();
                   
                   i = largest;
                } else {
                   break;
                }
             }
          }
          setHighlightIds([]);
          setStatusData({ label: 'Removed Max', value: max, type: 'single' });
          addLog(`Removed Max: ${max}`, 'success');
          await step(); // Show removed status
          break;

        case 'clear':
          setHeap([]);
          addLog("Cleared", 'success');
          break;

        case 'levelorder':
           if (currentHeap.length === 0) break;
           const loRes = [];
           for(let i=0; i<currentHeap.length; i++) {
              setHighlightIds([`heap-${i}`]);
              setHighlightColor('orange');
              loRes.push(currentHeap[i]);
              setStatusData({ label: 'Visited', items: [...loRes], activeIndex: i, type: 'array' });
              await step();
           }
           addLog(`levelorder: [${loRes.join(', ')}]`, 'success');
           break;

        case 'preorder':
        case 'inorder':
        case 'postorder':
          if (currentHeap.length === 0) { addLog("Heap empty"); break; }
          const res = [];
          
          const traverse = async (idx, type) => {
              if (idx >= currentHeap.length) return;
              
              setHighlightIds([`heap-${idx}`]);
              setHighlightColor('orange');
              
              if (type === 'preorder') { 
                  res.push(currentHeap[idx]); 
                  setStatusData({ label: 'Visited', items: [...res], activeIndex: res.length - 1, type: 'array' }); 
              }
              
              await step(); // Highlight & Output

              await traverse(2 * idx + 1, type);
              
              if (type === 'inorder') { 
                  setHighlightIds([`heap-${idx}`]);
                  setHighlightColor('orange');
                  res.push(currentHeap[idx]); 
                  setStatusData({ label: 'Visited', items: [...res], activeIndex: res.length - 1, type: 'array' }); 
                  await step();
              }
              
              await traverse(2 * idx + 2, type);
              
              if (type === 'postorder') { 
                  setHighlightIds([`heap-${idx}`]);
                  setHighlightColor('orange');
                  res.push(currentHeap[idx]); 
                  setStatusData({ label: 'Visited', items: [...res], activeIndex: res.length - 1, type: 'array' }); 
                  await step();
              }
          };
          
          await traverse(0, command);
          addLog(`${command}: [${res.join(', ')}]`, 'success');
          break;

        default:
          addLog(`Unknown: ${command}`, 'error');
      }
    } catch (e) {
      console.error(e);
      addLog("Error", 'error');
    } finally {
      endAnimation();
      setHighlightIds([]);
      setStatusData(null); 
    }
  };

  const arrayToTree = (arr, index = 0) => {
    if (index >= arr.length) return null;
    const node = { 
        value: arr[index], 
        id: `heap-${index}`,
        index: index
    };
    node.left = arrayToTree(arr, 2 * index + 1);
    node.right = arrayToTree(arr, 2 * index + 2);
    return node;
  };

  return (
    <VisualizerLayout logs={logs} setLogs={setLogs} onCommand={processCommand} stepper={stepper} statusData={statusData}>
      <div className="flex flex-col w-full h-full justify-center">
         {heap.length === 0 ? (
           <div className="text-slate-400 text-lg font-light m-auto">Heap is empty</div>
         ) : (
           <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
              <TreeRenderer 
                  root={arrayToTree(heap)} 
                  highlightIds={highlightIds} 
                  highlightColor={highlightColor}
                  type="heap" 
              />
           </div>
         )}
      </div>
    </VisualizerLayout>
  );
};

// ==========================================
// SHARED TREE RENDERER
// ==========================================

const TreeRenderer = ({ root, highlightIds = [], highlightColor = 'orange', type }) => {
  const nodeRadius = 22;
  const verticalSpacing = 70;
  
  const getTreeLayout = (node, depth = 0) => {
    if (!node) return { width: 0, nodes: [], links: [] };
    
    const minSep = 30; // Closer packing
    const leftRes = getTreeLayout(node.left, depth + 1);
    const rightRes = getTreeLayout(node.right, depth + 1);
    
    let computedWidth = 0;
    let rootX = 0;
    let nodes = [];
    let links = [];

    if (!node.left && !node.right) {
        computedWidth = nodeRadius * 2 + 10;
        rootX = computedWidth / 2;
        nodes.push({ x: rootX, y: depth*verticalSpacing+40, val: node.value, id: node.id, index: node.index });
    } else {
        const gap = 20;
        const leftW = node.left ? leftRes.width : 0;
        const rightW = node.right ? rightRes.width : 0;
        
        if (node.left && node.right) {
            computedWidth = leftW + rightW + gap;
            const leftStart = 0;
            const rightStart = leftW + gap;
            
            leftRes.nodes.forEach(n => nodes.push({ ...n, x: n.x + leftStart }));
            leftRes.links.forEach(l => links.push({ ...l, x1: l.x1 + leftStart, x2: l.x2 + leftStart }));
            
            rightRes.nodes.forEach(n => nodes.push({ ...n, x: n.x + rightStart }));
            rightRes.links.forEach(l => links.push({ ...l, x1: l.x1 + rightStart, x2: l.x2 + rightStart }));
            
            const realLeftRootX = leftStart + leftRes.rootX;
            const realRightRootX = rightStart + rightRes.rootX;
            rootX = (realLeftRootX + realRightRootX) / 2;
            
            nodes.push({ x: rootX, y: depth*verticalSpacing+40, val: node.value, id: node.id, index: node.index });
            links.push({ x1: rootX, y1: depth*verticalSpacing+40, x2: realLeftRootX, y2: (depth+1)*verticalSpacing+40 });
            links.push({ x1: rootX, y1: depth*verticalSpacing+40, x2: realRightRootX, y2: (depth+1)*verticalSpacing+40 });
            
        } else if (node.left) {
             const shift = 20;
             computedWidth = leftW + shift;
             
             leftRes.nodes.forEach(n => nodes.push({ ...n, x: n.x }));
             leftRes.links.forEach(l => links.push({ ...l, x1: l.x1, x2: l.x2 }));
             
             rootX = leftRes.rootX + shift;
             nodes.push({ x: rootX, y: depth*verticalSpacing+40, val: node.value, id: node.id, index: node.index });
             links.push({ x1: rootX, y1: depth*verticalSpacing+40, x2: leftRes.rootX, y2: (depth+1)*verticalSpacing+40 });
        } else {
             const shift = 20;
             computedWidth = rightW + shift;
             
             rightRes.nodes.forEach(n => nodes.push({ ...n, x: n.x + shift }));
             rightRes.links.forEach(l => links.push({ ...l, x1: l.x1 + shift, x2: l.x2 + shift }));
             
             rootX = rightRes.rootX;
             nodes.push({ x: rootX, y: depth*verticalSpacing+40, val: node.value, id: node.id, index: node.index });
             links.push({ x1: rootX, y1: depth*verticalSpacing+40, x2: rightRes.rootX + shift, y2: (depth+1)*verticalSpacing+40 });
        }
    }
    return { width: computedWidth, rootX, nodes, links };
  };

  const { nodes, links, width } = getTreeLayout(root);
  const totalWidth = Math.max(width, 600);
  const totalHeight = Math.max(500, nodes.length > 0 ? Math.max(...nodes.map(n => n.y)) + 50 : 0);
  
  const offsetX = (totalWidth - width) / 2;
  const centeredNodes = nodes.map(n => ({...n, x: n.x + offsetX}));
  const centeredLinks = links.map(l => ({...l, x1: l.x1 + offsetX, x2: l.x2 + offsetX}));

  const strokeColor = '#94a3b8'; // Slate-400 gray

  return (
    <div className="w-full h-full overflow-auto flex justify-center">
      <svg width={totalWidth} height={totalHeight} className="min-w-full">
        {centeredLinks.map((link, i) => (
          <line
            key={i}
            x1={link.x1}
            y1={link.y1}
            x2={link.x2}
            y2={link.y2}
            stroke={strokeColor}
            strokeWidth="2"
            className="animate-in fade-in duration-300"
          />
        ))}
        {centeredNodes.map((node, i) => {
          const isHighlighted = highlightIds.includes(node.id);
          const activeStroke = isHighlighted ? (highlightColor === 'red' ? '#ef4444' : highlightColor === 'green' ? '#22c55e' : highlightColor === 'blue' ? '#3b82f6' : '#f59e0b') : strokeColor;
          
          return (
            <g key={node.id} className="transition-all duration-300">
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill="white"
                stroke={activeStroke}
                strokeWidth={isHighlighted ? 3 : 2}
                className="transition-colors duration-300"
              />
              <text
                x={node.x}
                y={node.y}
                dy=".3em"
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-700 select-none pointer-events-none"
              >
                {node.val}
              </text>
              {node.index !== undefined && (
                <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono font-bold select-none pointer-events-none"
                >
                    {node.index}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default App;
