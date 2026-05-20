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
  Clock,
  Heart,
  Smile,
  Music
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
      case 'names': category = '春日部防衛隊抽選'; break;
      case 'wheel': category = '嘟嘟左衛門轉盤'; break;
      case 'numbers': category = '隨機動感數字'; break;
      case 'groups': category = '雙葉班分組對抗'; break;
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
    <div id="app-root" className="min-h-screen bg-shin-cream text-slate-800 pb-20 font-sans selection:bg-shin-red selection:text-white">
      
      {/* Background cute decorative cartoon clouds */}
      <div className="absolute top-16 left-8 w-16 h-10 bg-white/40 rounded-full blur-[1px] pointer-events-none hidden md:block" />
      <div className="absolute top-32 right-12 w-28 h-12 bg-white/40 rounded-full blur-[1px] pointer-events-none hidden md:block" />
      <div className="absolute top-2/3 left-6 w-20 h-10 bg-white/30 rounded-full blur-[1px] pointer-events-none hidden md:block" />

      {/* Playful Kindergarten-Themed Header */}
      <header className="border-b-4 border-slate-900 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand in Shin-chan red/yellow */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-shin-red cartoon-border cartoon-shadow-sm flex items-center justify-center text-white rotate-[-3deg] hover:rotate-[6deg] transition-transform cursor-pointer">
              <span className="text-xl">🎒</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
                小新玩抽籤！
                <span className="text-[11px] bg-shin-yellow text-slate-900 px-2 py-0.5 rounded-full font-black rotate-[2deg] cartoon-border-2">
                  春日部防衛隊
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <span>嘿嘿，屁屁星人與吉永老師都說讚 🐘</span>
              </p>
            </div>
          </div>

          {/* Sound and Action Kamen Action Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 sm:p-3 rounded-2xl cartoon-border-2 font-bold text-xs transition-all flex items-center gap-1.5 ${
                soundEnabled 
                  ? 'bg-shin-yellow text-slate-900 cartoon-shadow-sm' 
                  : 'bg-white text-slate-400'
              }`}
              title={soundEnabled ? '點按靜音' : '點按開啟音效'}
            >
              {soundEnabled ? (
                <>
                  <Music className="w-4 h-4 text-shin-red animate-bounce" />
                  <span className="hidden sm:inline">動感音樂開！</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">安靜</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 relative">
        
        {/* BANNER STICKERS */}
        <div className="bg-shin-yellow/30 border-4 border-dashed border-slate-900/60 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-[shin-shake_0.6s_infinite] origin-bottom block">🧒</span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                野原新之助的叮嚀：「點選下方不同主題開始玩隨機抽籤喔！」
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                小白說：「汪汪！(轉盤最公平，數字能抽出學生的座號唷)」
              </p>
            </div>
          </div>
          <div className="text-[11px] font-bold text-slate-600 bg-white border-2 border-slate-900 py-1.5 px-3 rounded-full flex items-center gap-1.5 select-none w-fit shrink-0 font-mono">
            <Clock className="w-3.5 h-3.5 text-shin-red" />
            <span>春日部時間：{new Date().toISOString().slice(11, 19)} (UTC)</span>
          </div>
        </div>

        {/* TAB CONTROLLERS DESIGN */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap bg-white border-4 border-slate-900 p-2 rounded-[24px] gap-2 cartoon-shadow-sm w-full md:w-auto">
            {/* Tab: Names */}
            <button
              onClick={() => setActiveTab('names')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'names'
                  ? 'bg-shin-red text-white cartoon-border-2 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>📋 防衛隊抽卡</span>
            </button>

            {/* Tab: Wheel */}
            <button
              onClick={() => setActiveTab('wheel')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'wheel'
                  ? 'bg-shin-yellow text-slate-900 cartoon-border-2 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>🎯 嘟嘟左衛門轉盤</span>
            </button>

            {/* Tab: Numbers */}
            <button
              onClick={() => setActiveTab('numbers')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'numbers'
                  ? 'bg-shin-blue text-white cartoon-border-2 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>🔢 隨機動感數字</span>
            </button>

            {/* Tab: Groups */}
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-shin-green text-white cartoon-border-2 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 雙葉班隨機分組</span>
            </button>
          </div>
        </div>

        {/* ACTIVE RAFFLE COMPONENT CONTAINER */}
        <div className="bg-white cartoon-border rounded-[32px] p-6 lg:p-8 cartoon-shadow-lg relative overflow-hidden">
          
          {/* Cute colorful star decorations at corners */}
          <div className="absolute top-3 right-3 text-lg opacity-40 select-none">⭐</div>
          <div className="absolute bottom-3 left-3 text-lg opacity-40 select-none">🎈</div>

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* History Logger */}
          <div className="lg:col-span-8">
            <DrawHistory history={history} onClearHistory={handleClearHistory} />
          </div>

          {/* Quick FAQ Explainer Card (Shin-chan themed) */}
          <div className="lg:col-span-4 bg-white cartoon-border rounded-[28px] p-5 cartoon-shadow space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                🍟 蠟筆小新的點心公約
              </h3>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">今天在幼稚班抽到好吃的巧克力餅乾？</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-shin-cream border-2 border-slate-900 rounded-2xl space-y-1">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>🔒 本地安全儲存</span>
                </h4>
                <p className="text-[10px] text-slate-600 font-semibold leading-normal">
                  所有待分組或抽籤名單均儲存於此瀏覽器(localStorage)中，完全保護隱私！
                  連風間偷偷藏起來的萌P偶像卡都不會被發現喔！
                </p>
              </div>

              <div className="p-3.5 bg-shin-cream border-2 border-slate-900 rounded-2xl space-y-1">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>🎶 嘟嘟左衛門樂章</span>
                </h4>
                <p className="text-[10px] text-slate-600 font-semibold leading-normal">
                  藉由 HTML5 Web Audio Synthesizer 自主合成高音短波。轉動轉盤與獲得幸運大獎時，
                  音效會演奏出動感超人出擊前的高頻笛鳴！
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

