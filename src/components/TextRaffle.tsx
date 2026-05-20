import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Check, Hash, RefreshCcw, FileSpreadsheet, Layers, Trophy } from 'lucide-react';
import { DEFAULT_PRESETS } from '../utils/presets';
import { audioSynth } from '../utils/audio';

interface TextRaffleProps {
  onDrawSuccess: (results: string[]) => void;
  soundEnabled: boolean;
}

export default function TextRaffle({ onDrawSuccess, soundEnabled }: TextRaffleProps) {
  const [inpText, setInpText] = useState(
    '小明\n小華\n小莉\n大豪\n阿志\n美玲\n雅婷\n冠宇\n家豪\n欣妤'
  );
  const [drawCount, setDrawCount] = useState<number>(1);
  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);
  
  // Real time draw status variables
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentRollingName, setCurrentRollingName] = useState<string>('？');
  const [winners, setWinners] = useState<string[]>([]);

  // Parse lines whenever the user types/updates
  const getCleanOptions = (raw: string): string[] => {
    return raw
      .split(/[\n,，]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  useEffect(() => {
    const list = getCleanOptions(inpText);
    setCandidates(list);
  }, [inpText]);

  const loadPreset = (presetId: string) => {
    const preset = DEFAULT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setInpText(preset.items.join('\n'));
      setWinners([]);
    }
  };

  const handleDraw = () => {
    const pool = [...candidates];
    if (pool.length === 0) {
      alert('請先輸入或載入抽籤名單！');
      return;
    }

    if (!allowRepeat && pool.length < drawCount) {
      alert(`候選名單只有 ${pool.length} 個，但設定要抽出 ${drawCount} 個，請增加名單數量或開啟「可重複抽取」。`);
      return;
    }

    setIsDrawing(true);
    setWinners([]);
    
    // Total spin steps/ticks
    let ticks = 0;
    const maxTicks = 25;
    const intervalTime = 80; // Fast ticks

    const interval = setInterval(() => {
      // Pick a random sample item to roll in the UI
      const mockIndex = Math.floor(Math.random() * pool.length);
      setCurrentRollingName(pool[mockIndex]);
      
      if (soundEnabled) {
        audioSynth.playTick(650 + (ticks * 10), 0.04);
      }
      
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        
        // Compute definitive winners
        const finalWinners: string[] = [];
        let itemsLeft = [...pool];

        for (let i = 0; i < drawCount; i++) {
          if (itemsLeft.length === 0 && !allowRepeat) break;
          
          const randomIndex = Math.floor(Math.random() * itemsLeft.length);
          const picked = itemsLeft[randomIndex];
          finalWinners.push(picked);

          if (!allowRepeat) {
            // Remove from pool so they are not drawn twice
            itemsLeft.splice(randomIndex, 1);
          }
        }

        setWinners(finalWinners);
        setIsDrawing(false);
        if (soundEnabled) {
          audioSynth.playSuccess();
        }
        onDrawSuccess(finalWinners);
      }
    }, intervalTime);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Configuration Column Left Side */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
            📋 抽籤名單與規則
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            輸入候選名額（可以用斷行、逗號區隔）
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">
            ⭐ 快速載入推薦模板範例
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {DEFAULT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loadPreset(p.id)}
                disabled={isDrawing}
                className="text-left text-xs bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/60 p-2 rounded-xl text-slate-700 font-medium transition-all truncate disabled:opacity-40"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Textarea */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 block">
              ✍️ 名單項目列表
            </label>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              共計 {candidates.length} 項
            </span>
          </div>
          <textarea
            rows={5}
            value={inpText}
            onChange={(e) => setInpText(e.target.value)}
            disabled={isDrawing}
            placeholder="請在此處輸入多個項目，每一行代表一個抽籤卡片..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-sans placeholder:text-slate-400 disabled:opacity-60"
          />
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-indigo-500" /> 抽選名額數量
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden px-2.5">
              <input
                type="number"
                min={1}
                max={50}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isDrawing}
                className="w-full bg-transparent border-none text-slate-800 font-bold text-sm py-2 px-1 focus:outline-none focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-400 shrink-0">人</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">
              🔄 抽取重複規則
            </label>
            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setAllowRepeat(false)}
                disabled={isDrawing}
                className={`flex-1 text-xs py-1.5 rounded-xl font-medium transition-all ${
                  !allowRepeat
                    ? 'bg-white shadow-xs text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                不重複
              </button>
              <button
                type="button"
                onClick={() => setAllowRepeat(true)}
                disabled={isDrawing}
                className={`flex-1 text-xs py-1.5 rounded-xl font-medium transition-all ${
                  allowRepeat
                    ? 'bg-white shadow-xs text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                可重複
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDraw}
          disabled={isDrawing || candidates.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isDrawing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>隨機選取中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>立即啟動抽籤</span>
            </>
          )}
        </button>
      </div>

      {/* Animation & Lottery Results Panel Right Side */}
      <div className="lg:col-span-7 bg-slate-50 border border-slate-100/50 rounded-3xl p-6 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Draw Board Box */}
        {isDrawing ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Spinning Lottery Sphere */}
            <div className="w-44 h-44 rounded-full bg-radial from-indigo-500/10 to-indigo-600/20 border-4 border-indigo-400 flex items-center justify-center shadow-lg relative animate-pulse">
              <div className="absolute inset-2 bg-indigo-500/5 rounded-full border border-dashed border-indigo-300 animate-[spin_8s_linear_infinite]" />
              <div className="text-3xl font-extrabold text-indigo-700 tracking-wider font-sans drop-shadow-sm truncate px-4 max-w-full text-center">
                {currentRollingName}
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-700 animate-pulse">
                🎲 系統正在進行公正隨機過濾...
              </p>
              <p className="text-xs text-slate-400">請稍候，結果即將出爐！</p>
            </div>
          </div>
        ) : winners.length > 0 ? (
          <div className="w-full space-y-6">
            <div className="text-center">
              <p className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">
                LUCKY WINNERS DEFINED
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                🎉 抽 籤 結 果 揭 曉
              </h3>
            </div>

            {/* Winners Display Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[260px] overflow-y-auto p-1">
              {winners.map((name, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-indigo-100 hover:border-indigo-200 p-4 rounded-2xl flex items-center justify-between shadow-xs transition-all animate-[fadeIn_0.3s_ease-out] relative overflow-hidden"
                >
                  <div className="absolute -left-1.5 -bottom-1 text-8xl font-black text-slate-50/70 select-none z-0">
                    {i + 1}
                  </div>
                  <div className="z-10 flex items-center gap-3">
                    <span className="w-7 h-7 bg-indigo-50 text-indigo-600 font-bold font-mono text-sm rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/50">
                      {i + 1}
                    </span>
                    <span className="text-base font-bold text-slate-800 font-sans tracking-wide">
                      {name}
                    </span>
                  </div>
                  <div className="z-10 bg-emerald-50 text-emerald-600 p-1.5 rounded-full">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setWinners([])}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-200/50 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> 清除結果重置
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xs space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 border border-slate-200/50 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-700">準備好進行一場抽籤了嗎？</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                在左側輸入或挑選您喜歡的名單類型，指定抽出數量，點選「立即啟動」即可開始隨機選取抽籤。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
