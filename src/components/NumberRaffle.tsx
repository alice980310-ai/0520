import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, Hash, ArrowRight, Check } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface NumberRaffleProps {
  onDrawSuccess: (results: string[]) => void;
  soundEnabled: boolean;
}

export default function NumberRaffle({ onDrawSuccess, soundEnabled }: NumberRaffleProps) {
  const [minNum, setMinNum] = useState<number>(1);
  const [maxNum, setMaxNum] = useState<number>(45);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rollingValue, setRollingValue] = useState<number>(20);
  const [winners, setWinners] = useState<number[]>([]);

  const handleDraw = () => {
    if (minNum >= maxNum) {
      alert('最小值要比最大值小才可以啦，真是的！');
      return;
    }

    const totalInterval = maxNum - minNum + 1;
    if (!allowRepeat && totalInterval < drawCount) {
      alert(`該範圍內共有 ${totalInterval} 個數字，但設定抽出 ${drawCount} 個，請放寬區間或開啟「允許重複數字」。`);
      return;
    }

    setIsDrawing(true);
    setWinners([]);

    // Keep rolling animation
    let ticks = 0;
    const maxTicks = 20;
    const intervalTime = 75;

    const interval = setInterval(() => {
      const mockVal = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      setRollingValue(mockVal);

      if (soundEnabled) {
        audioSynth.playTick(700 - (ticks * 10), 0.03);
      }

      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);

        const finalWinners: number[] = [];
        const pool: number[] = [];
        for (let i = minNum; i <= maxNum; i++) {
          pool.push(i);
        }

        if (allowRepeat) {
          for (let i = 0; i < drawCount; i++) {
            const randomPick = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            finalWinners.push(randomPick);
          }
        } else {
          for (let i = 0; i < drawCount; i++) {
            const index = Math.floor(Math.random() * pool.length);
            finalWinners.push(pool[index]);
            pool.splice(index, 1);
          }
        }

        // Sort results for better visual readability
        finalWinners.sort((a, b) => a - b);

        setWinners(finalWinners);
        setIsDrawing(false);
        if (soundEnabled) {
          audioSynth.playSuccess();
        }
        onDrawSuccess(finalWinners.map(String));
      }
    }, intervalTime);
  };

  const handleReset = () => {
    setMinNum(1);
    setMaxNum(45);
    setDrawCount(1);
    setAllowRepeat(false);
    setWinners([]);
    setIsDrawing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Parameter Settings Left Column */}
      <div className="lg:col-span-5 bg-white cartoon-border rounded-3xl p-5 cartoon-shadow space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            🔢 幸運座號 / 數字點名
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">自訂最小到最大的數字，隨機點選得獎座號！</p>
        </div>

        {/* Range Boxes Inputs */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 block">🎯 隨機整數範圍：</label>
          <div className="grid grid-cols-11 gap-2 items-center">
            {/* Min Input */}
            <div className="col-span-4 bg-slate-50 border-3 border-slate-900 rounded-2xl px-3 py-2 flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-400">MIN 最小</span>
              <input
                type="number"
                value={minNum}
                onChange={(e) => setMinNum(parseInt(e.target.value) || 0)}
                disabled={isDrawing}
                className="bg-transparent border-none text-slate-950 font-black text-sm focus:outline-none focus:ring-0 w-full mt-0.5"
              />
            </div>
            
            {/* Arrow Direction */}
            <div className="col-span-3 flex justify-center text-slate-900">
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </div>

            {/* Max Input */}
            <div className="col-span-4 bg-slate-50 border-3 border-slate-900 rounded-2xl px-3 py-2 flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-400">MAX 最大</span>
              <input
                type="number"
                value={maxNum}
                onChange={(e) => setMaxNum(parseInt(e.target.value) || 0)}
                disabled={isDrawing}
                className="bg-transparent border-none text-slate-950 font-black text-sm focus:outline-none focus:ring-0 w-full mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Quantities & Options */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 block">🔢 隨便抽幾個：</label>
            <div className="flex items-center bg-slate-50 border-3 border-slate-900 rounded-2xl overflow-hidden px-2.5">
              <input
                type="number"
                min={1}
                max={100}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isDrawing}
                className="w-full bg-transparent border-none text-slate-950 font-black text-sm py-2 px-1 focus:outline-none focus:ring-0"
              />
              <span className="text-[11px] font-black text-slate-400 shrink-0">個</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 block">🔄 抽完再塞回去：</label>
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
                不行
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
                可以
              </button>
            </div>
          </div>
        </div>

        {/* Draw Trigger */}
        <button
          type="button"
          onClick={handleDraw}
          disabled={isDrawing}
          className="w-full bg-shin-blue hover:bg-sky-400 active:translate-y-0.5 text-white py-3.5 px-4 rounded-2xl font-black text-sm border-3 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isDrawing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>數字高速旋轉中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>立即產生動感數字！</span>
            </>
          )}
        </button>

        <div className="pt-1.5 border-t-2 border-dashed border-slate-200">
          <button
            onClick={handleReset}
            disabled={isDrawing}
            className="text-xs font-black text-slate-500 hover:text-slate-850 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重設 1 到 45 號
          </button>
        </div>
      </div>

      {/* Numerical Visualizer Panel Right Column */}
      <div className="lg:col-span-7 bg-shin-cream border-4 border-slate-900 rounded-3xl p-6 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden cartoon-shadow">
        {isDrawing ? (
          <div className="text-center space-y-6 animate-pulse">
            {/* Spinning Golden Lottery ball with dynamic monospaced numbering */}
            <div className="w-40 h-40 rounded-full bg-shin-yellow border-4 border-slate-900 flex items-center justify-center shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] relative animate-bounce">
              <span className="text-5xl font-black text-slate-900 font-mono tracking-wider">
                {rollingValue}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-850 animate-pulse">
                🔢 正在 [{minNum} ~ {maxNum}] 區間隨機選號中...
              </p>
              <p className="text-[10px] text-slate-500 font-bold">雙葉幼稚園高能物理轉珠，保證完全公正！</p>
            </div>
          </div>
        ) : winners.length > 0 ? (
          <div className="w-full space-y-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-shin-blue tracking-wider uppercase mb-1">
                LUCKY NUMBERS GENERATED
              </p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                🎉 動感號碼牌！產出結果如下
              </h3>
            </div>

            {/* Balls Display Grid with flex/grid */}
            <div className="flex flex-wrap gap-4 items-center justify-center max-h-[260px] overflow-y-auto p-2">
              {winners.map((num, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-shin-yellow border-3 border-slate-900 rounded-full flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:scale-110 transition-transform animate-[fadeIn_0.3s_ease-out] relative"
                >
                  <span className="text-xl font-extrabold text-slate-950 font-mono">
                    {num}
                  </span>
                  <span className="text-[8px] font-black text-shin-red tracking-wide">
                    LOTTO
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setWinners([])}
                className="text-xs font-black text-slate-500 hover:text-slate-850 flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 移除抽中結果
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xs space-y-4">
            <div className="w-16 h-16 bg-white border-3 border-slate-900 text-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <Hash className="w-8 h-8 text-shin-blue" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-800">阿呆的幸運數字點點名</h4>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                可隨意指定座號（例如 1~30 號），或者是小熊星遊戲玩猜謎時需要的 1~100 號範圍，極速公平地搖號！
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

