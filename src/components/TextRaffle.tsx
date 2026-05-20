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
    '野原新之助 (小新)\n風間徹 (防衛隊)\n櫻田妮妮 (扮家家酒)\n佐藤正男 (愛哭鬼)\n阿呆 (石頭愛好者)\n野原小白 (神犬)\n野原廣志 (臭腳爸爸)\n野原美冴 (主婦)\n吉永綠 (老師)\n松坂梅 (玫瑰班)'
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
      alert('請先在左邊輸入今天想抽出誰的名字喔！');
      return;
    }

    if (!allowRepeat && pool.length < drawCount) {
      alert(`春日部防衛隊名冊僅有 ${pool.length} 個選項，卻設定抽出 ${drawCount} 個，請按「可重複」或寫入更多選項。`);
      return;
    }

    setIsDrawing(true);
    setWinners([]);
    
    let ticks = 0;
    const maxTicks = 25;
    const intervalTime = 80;

    const interval = setInterval(() => {
      const mockIndex = Math.floor(Math.random() * pool.length);
      setCurrentRollingName(pool[mockIndex]);
      
      if (soundEnabled) {
        audioSynth.playTick(600 + (ticks * 15), 0.035);
      }
      
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        
        const finalWinners: string[] = [];
        let itemsLeft = [...pool];

        for (let i = 0; i < drawCount; i++) {
          if (itemsLeft.length === 0 && !allowRepeat) break;
          
          const randomIndex = Math.floor(Math.random() * itemsLeft.length);
          const picked = itemsLeft[randomIndex];
          finalWinners.push(picked);

          if (!allowRepeat) {
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
      <div className="lg:col-span-5 bg-white cartoon-border rounded-3xl p-5 cartoon-shadow space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            📋 春日部防衛名單設定
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            名單中每一行代表一個抽籤卡片，支援複製與手寫
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 block">
            🎒 快速載入幼稚班推薦模板：
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => loadPreset(p.id)}
                disabled={isDrawing}
                className="text-left text-xs bg-slate-50 border-2 border-slate-900 hover:bg-shin-yellow p-2 rounded-xl text-slate-900 font-black transition-all truncate disabled:opacity-40"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Textarea */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-600 block">
              ✍️ 防衛隊員 / 名單卡片：
            </label>
            <span className="text-[10px] font-black bg-shin-yellow text-slate-900 px-2.5 py-0.5 rounded-full border-2 border-slate-900">
              共 {candidates.length} 項
            </span>
          </div>
          <textarea
            rows={5}
            value={inpText}
            onChange={(e) => setInpText(e.target.value)}
            disabled={isDrawing}
            placeholder="請在此處輸入多個項目，每一行代表一個點名名冊..."
            className="w-full bg-slate-50 border-3 border-slate-900 rounded-2xl p-3 text-xs font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-shin-yellow transition-all placeholder:text-slate-400 disabled:opacity-60"
          />
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-shin-red" /> 抽選人數 / 獎品數
            </label>
            <div className="flex items-center bg-slate-50 border-3 border-slate-900 rounded-2xl overflow-hidden px-2.5">
              <input
                type="number"
                min={1}
                max={50}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isDrawing}
                className="w-full bg-transparent border-none text-slate-950 font-black text-sm py-2 px-1 focus:outline-none focus:ring-0"
              />
              <span className="text-xs font-black text-slate-400 shrink-0">人</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 block">
              🔄 抽獎重複設定
            </label>
            <div className="flex bg-slate-100 border-2 border-slate-900 rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setAllowRepeat(false)}
                disabled={isDrawing}
                className={`flex-1 text-[10px] font-black py-1.5 rounded-xl transition-all border ${
                  !allowRepeat
                    ? 'bg-white border-2 border-slate-900 text-slate-900 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                不重複
              </button>
              <button
                type="button"
                onClick={() => setAllowRepeat(true)}
                disabled={isDrawing}
                className={`flex-1 text-[10px] font-black py-1.5 rounded-xl transition-all border ${
                  allowRepeat
                    ? 'bg-white border-2 border-slate-900 text-slate-900 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
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
          className="w-full bg-shin-red hover:bg-red-500 active:translate-y-0.5 text-slate-900 py-3.5 px-4 rounded-2xl font-black text-sm border-3 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isDrawing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-900 border-t-white rounded-full animate-spin" />
              <span>春日部隨機挑選中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white text-white" />
              <span>立即點兵抽籤！</span>
            </>
          )}
        </button>
      </div>

      {/* Animation & Lottery Results Panel Right Side */}
      <div className="lg:col-span-7 bg-shin-cream border-4 border-slate-900 rounded-3xl p-6 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden cartoon-shadow">
        
        {isDrawing ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Spinning Lottery Sphere */}
            <div className="w-44 h-44 rounded-full bg-shin-yellow border-4 border-slate-900 flex items-center justify-center shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] relative animate-pulse">
              <div className="absolute inset-2 bg-white/20 rounded-full border-4 border-dashed border-slate-900 animate-[spin_10s_linear_infinite]" />
              <div className="text-xl font-black text-slate-900 tracking-wider font-sans drop-shadow-sm truncate px-4 max-w-full text-center">
                {currentRollingName}
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-xs font-black text-slate-850 animate-pulse">
                🎲 小新正在用力挑選最最幸運的卡單...
              </p>
              <p className="text-[10px] text-slate-500 font-bold">請稍等唷！雙葉幼稚園最公正的算法進行中</p>
            </div>
          </div>
        ) : winners.length > 0 ? (
          <div className="w-full space-y-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-shin-red tracking-wider uppercase mb-1">
                LUCKY MEMBERS CHOSEN
              </p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                🎉 大 喜！抽 籤 結 果 揭 曉
              </h3>
            </div>

            {/* Winners Display Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[250px] overflow-y-auto p-1">
              {winners.map((name, i) => (
                <div
                  key={i}
                  className="bg-white border-3 border-slate-900 p-4 rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all animate-[fadeIn_0.3s_ease-out] relative overflow-hidden"
                >
                  <div className="absolute -left-1.5 -bottom-1 text-8xl font-black text-slate-100/50 select-none z-0">
                    {i + 1}
                  </div>
                  <div className="z-10 flex items-center gap-3">
                    <span className="w-7 h-7 bg-shin-yellow text-slate-900 font-black font-mono text-xs rounded-xl flex items-center justify-center shrink-0 border-2 border-slate-900">
                      {i + 1}
                    </span>
                    <span className="text-sm font-black text-slate-900 font-sans tracking-wide">
                      {name}
                    </span>
                  </div>
                  <div className="z-10 bg-shin-green border-2 border-slate-900 text-slate-900 p-1 rounded-full">
                    <Check className="w-3.5 h-3.5" strokeWidth={4} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setWinners([])}
                className="text-xs font-black text-slate-500 hover:text-slate-800 flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> 清除抽中結果並重新選擇
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xs space-y-4">
            <div className="w-16 h-16 bg-white border-3 border-slate-900 text-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <Sparkles className="w-8 h-8 text-shin-yellow fill-shin-yellow" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">小新：「今天你要抽取誰呢？」</h4>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                在左側寫下今天的成員（像是春日部幼稚園或是班級座號），決定你要抽幾個人，然後點選「立即點兵抽籤！」
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

