import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ClipboardList, 
  Compass, 
  Hash, 
  Users, 
  Award, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { DrawMode, WinnerHistory } from './types';
import { audioSynth } from './utils/audio';

// Components
import TextRaffle from './components/TextRaffle';
import LuckyWheel from './components/LuckyWheel';
import NumberRaffle from './components/NumberRaffle';
import GroupRandomizer from './components/GroupRandomizer';
import DrawHistory from './components/DrawHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState<DrawMode>('names');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [history, setHistory] = useState<WinnerHistory[]>([]);

  // Sound effect state tracking
  useEffect(() => {
    audioSynth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lucky_draw_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
  }, []);

  // Save history on changes
  const saveHistory = (newHistory: WinnerHistory[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('lucky_draw_history', JSON.stringify(newHistory));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  };

  const handleDrawSuccess = (results: string[] | string) => {
    const formattedResult = Array.isArray(results) ? results : [results];
    
    // Add custom winner history log
    let category = '';
    switch (activeTab) {
      case 'names': category = '名單隨機抽選'; break;
      case 'wheel': category = '幸運轉盤抽選'; break;
      case 'numbers': category = '數字範圍抽選'; break;
      case 'groups': category = '分組分配抽出'; break;
    }

    const newLog: WinnerHistory = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      mode: activeTab,
      title: category,
      result: formattedResult
    };

    saveHistory([newLog, ...history]);
  };

  const handleClearHistory = () => {
    if (confirm('確定要清除所有得獎與抽籤歷史紀錄嗎？')) {
      saveHistory([]);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#fafbfc] text-slate-900 pb-16 font-sans">
      
      {/* Premium Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-4 ring-indigo-50">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                抽籤隨機選擇器
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold font-mono">
                  v1.2
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">✨ 公平、有趣、創意的決策好幫手</p>
            </div>
          </div>

          {/* Sound toggle controls */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 ${
                soundEnabled 
                  ? 'bg-rose-50/50 border-rose-100 text-rose-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title={soundEnabled ? '點按靜音' : '點按開啟音效'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-bold leading-none hidden sm:inline">音效啟動中</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-xs font-bold leading-none hidden sm:inline">靜效</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* TAB CONTROLLERS DESIGN */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('names')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'names'
                  ? 'bg-white shadow-xs text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>📋 名單抽籤</span>
            </button>
            <button
              onClick={() => setActiveTab('wheel')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'wheel'
                  ? 'bg-white shadow-xs text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>🎯 幸運大轉盤</span>
            </button>
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'numbers'
                  ? 'bg-white shadow-xs text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>🔢 隨機數字</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-white shadow-xs text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 隨機分組</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 bg-white border border-slate-100 py-1.5 px-3 rounded-xl flex items-center gap-1.5 select-none w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>目前時間 (UTC)：{new Date().toISOString().slice(11, 19)}</span>
          </div>
        </div>

        {/* ACTIVE RAFFLE COMPONENT CONTAINER */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 lg:p-8 shadow-xs animate-[fadeIn_0.5s_ease-out]">
          {activeTab === 'names' && (
            <TextRaffle onDrawSuccess={handleDrawSuccess} soundEnabled={soundEnabled} />
          )}
          {activeTab === 'wheel' && (
            <LuckyWheel onDrawSuccess={handleDrawSuccess} soundEnabled={soundEnabled} />
          )}
          {activeTab === 'numbers' && (
            <NumberRaffle onDrawSuccess={handleDrawSuccess} soundEnabled={soundEnabled} />
          )}
          {activeTab === 'groups' && (
            <GroupRandomizer soundEnabled={soundEnabled} />
          )}
        </div>

        {/* BENTO BOTTOM SECTION (HISTORY / EXPLAINERS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* History Logger */}
          <div className="lg:col-span-8">
            <DrawHistory history={history} onClearHistory={handleClearHistory} />
          </div>

          {/* Quick FAQ Explainer Cards (Bento Grid) */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                ⚡ 透明随機安全聲明
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">我們的隨幾篩選算法保障公允</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-slate-700">🔒 隱私與安全</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  所有待分組、抽籤之名冊及數據，均完全儲存在您本地瀏覽器的快取中。
                  我們不會在任何遠端伺服器備份或傳遞，保障個人與學生隱私百分之百不外洩。
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-slate-700">🎧 擬真合成音效</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  採用 HTML5 Web Audio API 即時合音，產出流暢的滴答指針、得獎禮炮與經典電子叮咚，
                  無須加載大塊音頻或耗損多餘網路資源。
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
