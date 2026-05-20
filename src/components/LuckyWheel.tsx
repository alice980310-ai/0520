import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Plus, Trash2, HelpCircle } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface LuckyWheelProps {
  onDrawSuccess: (result: string) => void;
  soundEnabled: boolean;
}

const DEFAULT_WHEEL_ITEMS = ['拉麵', '滷肉飯', '火鍋', '壽司', '麥當勞', '義大利麵', '便當', '健康餐'];

// Generate soft premium colors for wheel segments
const SEGMENT_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#facc15',
  '#4ade80', '#2dd4bf', '#38bdf8', '#60a5fa',
  '#818cf8', '#a78bfa', '#c084fc', '#f472b6'
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
        alert('這個選項已經存在囉！');
        return;
      }
      setItems([...items, trimmed]);
      setInputValue('');
      setWinner(null);
    }
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 2) {
      alert('轉盤最少需要有 2 個選項喔！');
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

    // Pick a random winner in advance to calculate final exact stopping angle
    const winnerIndex = Math.floor(Math.random() * items.length);
    const segmentAngle = 360 / items.length;
    
    // In our SVG layout, index 0 segment points upward and rotates clockwise.
    // To land exactly in the middle of winnerIndex segment at the top pointer (at 270 degrees / standard compass coords,
    // or we can calculate relative to the top reference line):
    // Standard drawing arrow is at top: 90 degrees offset.
    // The target angle to stop on the pointer (top is at 0 rotation, but with clockwise rotation, SVG segment at index `i`
    // starts at `i * segmentAngle` and ends at `(i+1)*segmentAngle`).
    // To have the pointer select segment `winnerIndex`:
    // The relative stop angle needs to align segment `winnerIndex` inside [-segmentAngle/2, segmentAngle/2] at the top (which is 0 or 360).
    const midSegmentAngle = (winnerIndex + 0.5) * segmentAngle;
    const targetAngle = 360 - midSegmentAngle; // offset to top
    
    // Spin around at least 5 to 8 full revolutions to make it suspenseful
    const minSpins = 5;
    const additionalSpins = Math.floor(Math.random() * 3) + minSpins;
    const finalRotationalValue = currentRotationRef.current + (additionalSpins * 360) + targetAngle - (currentRotationRef.current % 360);

    const startRot = currentRotationRef.current;
    const distance = finalRotationalValue - startRot;
    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    lastTickAngleRef.current = startRot;

    // Custom easing function: quartic ease out (fast start, long slow deceleration)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animateWheel = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentRot = startRot + distance * easedProgress;
      setRotation(currentRot);

      // Analyze degree changes to produce realistic mechanical tick-ticks
      const deltaAngle = currentRot - lastTickAngleRef.current;
      const segmentArc = 360 / items.length;

      // Tick audio synthesizer
      if (Math.floor(currentRot / segmentArc) > Math.floor(lastTickAngleRef.current / segmentArc)) {
        // High pitched short synth tick
        if (soundEnabled) {
          audioSynth.playTick(600 + (progress * 400), 0.03);
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
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
            🎯 轉盤選項設定 ({items.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">自訂轉盤分割區間以決定隨機命運</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="新增新項目..."
            disabled={isSpinning}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isSpinning || !inputValue.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-2xl transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Scrolling Items Box */}
        <div className="max-h-[280px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-100/80 rounded-2xl group hover:border-slate-200/80 hover:bg-slate-100/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/5"
                  style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(index)}
                disabled={isSpinning}
                className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg hover:bg-rose-50 transition-all disabled:opacity-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={isSpinning}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100/50 transition-all disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 恢復預設
          </button>
          
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> 指針停落在最上方
          </div>
        </div>
      </div>

      {/* Spinning Wheel Space Right Panel */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100/50 rounded-3xl min-h-[450px] relative overflow-hidden">
        
        {/* Needle/Pointer */}
        <div className="absolute top-[40px] z-30 flex flex-col items-center">
          {/* Beautiful Pointer SVG */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className={`transform origin-top transition-transform duration-75 ${
                isSpinning ? 'rotate-2' : 'rotate-0'
              }`}
            >
              <path
                d="M16 32L6 10C5 8 6 5 9 5H23C26 5 27 8 26 10L16 32Z"
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="11" r="3.5" fill="#fbcfe8" />
            </svg>
          </div>
        </div>

        {/* Outer Wheel Container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full shadow-2xl bg-white border-8 border-slate-800 flex items-center justify-center">
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
                  // Calculate pie path coordinates
                  const radStart = ((startAngle - 90) * Math.PI) / 180;
                  const radEnd = (((startAngle + angle) - 90) * Math.PI) / 180;

                  const x1 = 100 + 100 * Math.cos(radStart);
                  const y1 = 100 + 100 * Math.sin(radStart);
                  const x2 = 100 + 100 * Math.cos(radEnd);
                  const y2 = 100 + 100 * Math.sin(radEnd);

                  // Larger arc flag
                  const largeArc = angle > 180 ? 1 : 0;

                  // Text position coordinates
                  const textAngle = startAngle + angle / 2;
                  const radText = ((textAngle - 90) * Math.PI) / 180;
                  // Position label around 62% radius
                  const tx = 100 + 64 * Math.cos(radText);
                  const ty = 100 + 64 * Math.sin(radText);

                  return (
                    <g key={index}>
                      {/* Segment Slice */}
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                      {/* Segment Label (Rotated gracefully facing outward) */}
                      <text
                        x={tx}
                        y={ty}
                        fill="#1e293b"
                        fontSize={items.length > 10 ? '5.5' : '7'}
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                        className="font-sans antialiased"
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
          <div className="absolute w-16 h-16 rounded-full bg-slate-800 border-4 border-amber-300 flex items-center justify-center shadow-md z-20">
            <button
              onClick={spin}
              disabled={isSpinning}
              className={`w-full h-full rounded-full font-bold text-sm tracking-tight transition-all text-amber-300 flex flex-col items-center justify-center ${
                isSpinning
                  ? 'bg-slate-700 opacity-60 cursor-not-allowed text-xs'
                  : 'bg-slate-800 hover:bg-slate-900 active:scale-95'
              }`}
            >
              {isSpinning ? (
                <span className="text-[10px] animate-pulse">SPINNING</span>
              ) : (
                <span className="flex flex-col items-center">
                  <Play className="w-5 h-5 fill-amber-300" strokeWidth={0} />
                  <span className="text-[9px] -mt-0.5 font-sans font-extrabold text-white">啟動</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Instant Reveal overlay or indicator */}
        <div className="mt-6 flex flex-col items-center min-h-[50px]">
          {winner ? (
            <div className="animate-bounce bg-pink-50 border border-pink-200 text-pink-700 px-6 py-2.5 rounded-full shadow-sm text-center font-bold text-lg">
              🎉 抽出：<span className="text-pink-600 underline underline-offset-4 font-extrabold">{winner}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2 font-medium">按中心啟動開始隨機轉盤抽籤</p>
          )}
        </div>
      </div>
    </div>
  );
}
