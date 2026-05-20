import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Plus, Trash2, HelpCircle } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface LuckyWheelProps {
  onDrawSuccess: (result: string) => void;
  soundEnabled: boolean;
}

const DEFAULT_WHEEL_ITEMS = [
  '小熊星星餅乾 🍫',
  '娜娜子大姐姐 💖',
  '絕版動感超人卡 🃏',
  '康達姆機器人 🤖',
  '美味春日部炒麵 🍜',
  '小白特製愛心罐頭 🦴',
  '美冴藏的私房錢 💴',
  '廣志的特臭襪子 (大凶)'
];

const SEGMENT_COLORS = [
  '#ff4d4f', // Red
  '#ffd53e', // Yellow
  '#3fa9f5', // Blue
  '#74c540', // Green
  '#ff85c0', // Pink
  '#ff9c6e', // Orange
  '#b37feb', // Purple
  '#36cfc9'  // Cyan
];

export default function LuckyWheel({ onDrawSuccess, soundEnabled }: LuckyWheelProps) {
  const [items, setItems] = useState<string[]>(DEFAULT_WHEEL_ITEMS);
  const [inputValue, setInputValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  
  const currentRotationRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTickAngleRef = useRef<number>(0);

  // Sync rotation with current rotation ref to allow cumulative spins
  useEffect(() => {
    currentRotationRef.current = rotation;
  }, [rotation]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      if (items.includes(trimmed)) {
        alert('這個美味選項已經在裡面囉！');
        return;
      }
      setItems([...items, trimmed]);
      setInputValue('');
      setWinner(null);
    }
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 2) {
      alert('轉盤起碼要有 2 個選項才能開始轉喔！');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setWinner(null);
  };

  const handleReset = () => {
    setItems(DEFAULT_WHEEL_ITEMS);
    setRotation(0);
    setWinner(null);
    setIsSpinning(false);
    currentRotationRef.current = 0;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const spin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const winnerIndex = Math.floor(Math.random() * items.length);
    const segmentAngle = 360 / items.length;
    
    const midSegmentAngle = (winnerIndex + 0.5) * segmentAngle;
    const targetAngle = 360 - midSegmentAngle; // offset to top
    
    const minSpins = 6;
    const additionalSpins = Math.floor(Math.random() * 3) + minSpins;
    const finalRotationalValue = currentRotationRef.current + (additionalSpins * 360) + targetAngle - (currentRotationRef.current % 360);

    const startRot = currentRotationRef.current;
    const distance = finalRotationalValue - startRot;
    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();

    lastTickAngleRef.current = startRot;

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animateWheel = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentRot = startRot + distance * easedProgress;
      setRotation(currentRot);

      const segmentArc = 360 / items.length;

      if (Math.floor(currentRot / segmentArc) > Math.floor(lastTickAngleRef.current / segmentArc)) {
        if (soundEnabled) {
          // Play a adorable high mechanical synth tick
          audioSynth.playTick(550 + (progress * 500), 0.025);
        }
      }
      lastTickAngleRef.current = currentRot;

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animateWheel);
      } else {
        setIsSpinning(false);
        const winItem = items[winnerIndex];
        setWinner(winItem);
        if (soundEnabled) {
          audioSynth.playSuccess();
        }
        onDrawSuccess(winItem);
      }
    };

    requestRef.current = requestAnimationFrame(animateWheel);
  };

  const segmentAngle = 360 / items.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Selector Options Left Sidebar */}
      <div className="lg:col-span-5 bg-white cartoon-border rounded-3xl p-5 cartoon-shadow space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            🍕 幼稚園轉盤設定 ({items.length})
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">自己寫下好玩的選項，讓命運去轉動吧！</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="新增想抽出的寶物..."
            disabled={isSpinning}
            className="flex-1 bg-slate-50 border-3 border-slate-900 text-slate-950 text-xs font-bold px-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-shin-yellow transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isSpinning || !inputValue.trim()}
            className="bg-shin-green text-slate-950 border-3 border-slate-900 px-4 rounded-2xl font-black text-sm hover:bg-emerald-400 active:translate-y-0.5 shadow-[2px_2px_0px_0px_#0f172a] shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
        </form>

        {/* Scrolling Items Box */}
        <div className="max-h-[250px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-2 border-slate-950 rounded-2xl group hover:bg-shin-cream transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full shrink-0 border-2 border-slate-950"
                  style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                />
                <span className="text-xs font-black text-slate-800">{item}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(index)}
                disabled={isSpinning}
                className="text-slate-400 hover:text-shin-red opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-slate-800 transition-all disabled:opacity-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t-2 border-dashed border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={isSpinning}
            className="text-xs font-black text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-150 transition-all disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 恢復小新最愛
          </button>
          
          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> 三角指針停落在頂部
          </div>
        </div>
      </div>

      {/* Spinning Wheel Space Right Panel */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-shin-cream border-4 border-slate-900 rounded-3xl min-h-[450px] relative overflow-hidden cartoon-shadow">
        
        {/* Needle/Pointer */}
        <div className="absolute top-[34px] z-30 flex flex-col items-center">
          <div className="w-9 h-9 flex items-center justify-center animate-[shin-shake_0.8s_infinite] origin-top">
            <svg
              width="36"
              height="36"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M16 32L5 8C4 6 5 3 9 3H23C27 3 28 6 27 8L16 32Z"
                fill="#ff4d4f"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="10" r="4.5" fill="#ffd53e" stroke="#0f172a" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Outer Wheel Container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[360px] md:h-[360px] rounded-full shadow-lg bg-white border-8 border-slate-950 flex items-center justify-center">
          
          {/* Canvas or SVG Wrapper */}
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'none' : 'transform 1s cubic-bezier(0.1, 0.8, 0.3, 1)',
            }}
          >
            {items.length > 0 && (
              <svg viewBox="0 0 200 200" className="w-full h-full select-none">
                {items.map((item, index) => {
                  const angle = segmentAngle;
                  const startAngle = index * angle;
                  const radStart = ((startAngle - 90) * Math.PI) / 180;
                  const radEnd = (((startAngle + angle) - 90) * Math.PI) / 180;

                  const x1 = 100 + 100 * Math.cos(radStart);
                  const y1 = 100 + 100 * Math.sin(radStart);
                  const x2 = 100 + 100 * Math.cos(radEnd);
                  const y2 = 100 + 100 * Math.sin(radEnd);

                  const largeArc = angle > 180 ? 1 : 0;

                  const textAngle = startAngle + angle / 2;
                  const radText = ((textAngle - 90) * Math.PI) / 180;
                  const tx = 100 + 60 * Math.cos(radText);
                  const ty = 100 + 60 * Math.sin(radText);

                  return (
                    <g key={index}>
                      {/* Segment Slice */}
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                      />
                      {/* Segment Label (Rotated gracefully facing outward) */}
                      <text
                        x={tx}
                        y={ty}
                        fill="#0f172a"
                        fontSize={items.length > 10 ? '5.5' : '7'}
                        fontWeight="900"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                        className="font-sans font-black tracking-tighter"
                      >
                        {item.length > 8 ? `${item.slice(0, 8)}...` : item}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Golden Center Hub */}
          <div className="absolute w-18 h-18 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center shadow-md z-20">
            <button
              onClick={spin}
              disabled={isSpinning}
              className={`w-full h-full rounded-full font-black text-xs tracking-wider transition-all text-white flex flex-col items-center justify-center ${
                isSpinning
                  ? 'bg-slate-800 opacity-60 cursor-not-allowed text-[10px]'
                  : 'bg-shin-yellow hover:bg-amber-400 border-3 border-transparent hover:border-slate-950 text-slate-900'
              }`}
            >
              {isSpinning ? (
                <span className="text-[10px] animate-pulse">滾動中</span>
              ) : (
                <span className="flex flex-col items-center gap-0.5">
                  <span className="text-[15px] animate-[shin-shake_0.5s_infinite]">🌀</span>
                  <span className="text-[11px] font-black font-sans leading-none">轉！</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Instant Reveal overlay or indicator */}
        <div className="mt-8 flex flex-col items-center min-h-[60px]">
          {winner ? (
            <div className="animate-bounce bg-white border-4 border-slate-900 text-slate-900 px-8 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] text-center font-black text-lg">
              🎯 動感抽出：<span className="text-shin-red text-xl font-black underline underline-offset-4">{winner}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-600 font-black animate-pulse">
              🧒 小新：「準備好了嗎？按一下中間的🌀箭頭開始抽籤吧！」
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

