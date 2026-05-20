import React, { useState } from 'react';
import { Play, RotateCcw, Sparkles, Hash, ArrowRight, Check } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface NumberRaffleProps {
  onDrawSuccess: (results: string[]) => void;
  soundEnabled: boolean;
}

export default function NumberRaffle({ onDrawSuccess, soundEnabled }: NumberRaffleProps) {
  const [minNum, setMinNum] = useState<number>(1);
  const [maxNum, setMaxNum] = useState<number>(100);
  const [drawCount, setDrawCount] = useState<number>(1);
  const [allowRepeat, setAllowRepeat] = useState<boolean>(false);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rollingValue, setRollingValue] = useState<number>(50);
  const [winners, setWinners] = useState<number[]>([]);

  const handleDraw = () => {
    if (minNum >= maxNum) {
      alert('最小值必填，且必須小於最大值！');
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

        // Calculate actual results
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
    setMaxNum(100);
    setDrawCount(1);
    setAllowRepeat(false);
    setWinners([]);
    setIsDrawing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Parameter Settings Left Column */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
            🔢 數字區間設定
          </h2>
          <p className="text-xs text-slate-400 mt-1">設定抽取整數數字的上下限範疇與抽取張數</p>
        </div>

        {/* Range Boxes Inputs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 block">🎯 隨機整數區間</label>
          <div className="grid grid-cols-11 gap-1 items-center">
            {/* Min Input */}
            <div className="col-span-4 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400">MIN 最小值</span>
              <input
                type="number"
                value={minNum}
                onChange={(e) => setMinNum(parseInt(e.target.value) || 0)}
                disabled={isDrawing}
                className="bg-transparent border-none text-slate-800 font-extrabold text-sm focus:outline-none focus:ring-0 w-full mt-0.5"
              />
            </div>
            
            {/* Arrow Direction */}
            <div className="col-span-3 flex justify-center text-slate-300">
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Max Input */}
            <div className="col-span-4 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400">MAX 最大值</span>
              <input
                type="number"
                value={maxNum}
                onChange={(e) => setMaxNum(parseInt(e.target.value) || 0)}
                disabled={isDrawing}
                className="bg-transparent border-none text-slate-800 font-extrabold text-sm focus:outline-none focus:ring-0 w-full mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Quantities & Options */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">🔢 抽取數量</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden px-2.5">
              <input
                type="number"
                min={1}
                max={100}
                value={drawCount}
                onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isDrawing}
                className="w-full bg-transparent border-none text-slate-800 font-bold text-sm py-2 px-1 focus:outline-none focus:ring-0"
              />
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">個</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">🔄 允許重複數字</label>
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
                不可
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isDrawing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>隨機滾動中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>立即產生數字</span>
            </>
          )}
        </button>

        <div className="pt-1.5 border-t border-slate-100">
          <button
            onClick={handleReset}
            disabled={isDrawing}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100/50 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 恢復預設值
          </button>
        </div>
      </div>

      {/* Numerical Visualizer Panel Right Column */}
      <div className="lg:col-span-7 bg-slate-50 border border-slate-100/50 rounded-3xl p-6 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
        {isDrawing ? (
          <div className="text-center space-y-6">
            {/* Spinning Golden Lottery ball with dynamic monospaced numbering */}
            <div className="w-40 h-40 rounded-full bg-radial from-amber-300/40 to-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-lg relative animate-bounce">
              <span className="text-5xl font-extrabold text-amber-600 font-mono tracking-wider">
                {rollingValue}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700 animate-pulse">
                🔢 正在區間 [{minNum} ~ {maxNum}] 隨機篩選中...
              </p>
              <p className="text-xs text-slate-400">數位抽籤秉持物理級別擬真概率公允</p>
            </div>
          </div>
        ) : winners.length > 0 ? (
          <div className="w-full space-y-6">
            <div className="text-center">
              <p className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-1">
                LUCKY NUMBERS GENERATED
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                🎉 幸 運 數 字 揭 曉
              </h3>
            </div>

            {/* Balls Display Grid with flex/grid */}
            <div className="flex flex-wrap gap-4 items-center justify-center max-h-[260px] overflow-y-auto p-2">
              {winners.map((num, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-white border-2 border-indigo-500/80 rounded-full flex flex-col items-center justify-center shadow-md hover:scale-105 transition-transform animate-[fadeIn_0.3s_ease-out] relative"
                >
                  <span className="text-xl font-black text-indigo-700 font-mono">
                    {num}
                  </span>
                  <span className="text-[8px] font-bold text-indigo-300 font-sans tracking-wide">
                    LOTTO
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setWinners([])}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-200/50 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 移除重新抽取
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xs space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 border border-slate-200/50 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Hash className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-700">準備隨機抽取數字？</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                可指定例如 1-49 (樂透抽獎)、1-100 (號碼牌)、甚至學生的座號點名。
                按「立即產生數字」即可獲得結果。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
