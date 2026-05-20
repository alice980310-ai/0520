import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCcw, Users, UserPlus, FileSpreadsheet, Group } from 'lucide-react';
import { DEFAULT_PRESETS } from '../utils/presets';
import { audioSynth } from '../utils/audio';

interface GroupRandomizerProps {
  soundEnabled: boolean;
}

interface GroupResult {
  groupName: string;
  members: string[];
}

const PRESET_GROUPS = [
  '向日葵班 🌻', '玫瑰班 🌹', '櫻花班 🌸', '鬱金香班 🌷', 
  '動感超人隊 ⚡', '小熊星餅乾隊 🍫', '肥嘟嘟左衛門隊 🐷', 
  '神犬小白隊 🐾', '康達姆機器人隊 🤖', '春日部防衛隊 🎒'
];

export default function GroupRandomizer({ soundEnabled }: GroupRandomizerProps) {
  const [inpText, setInpText] = useState(
    '野原新之助 (小新)\n風間徹\n櫻田妮妮\n佐藤正男\n阿呆\n野原廣志\n野原美冴\n野原向日葵\n野原小白 \n吉永綠\n松坂梅\n上尾真美'
  );
  const [groupMode, setGroupMode] = useState<'byCount' | 'byMembers'>('byCount');
  const [groupTarget, setGroupTarget] = useState<number>(3); // divide into 3 groups
  
  const [isGrouping, setIsGrouping] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [groupedResults, setGroupedResults] = useState<GroupResult[]>([]);

  // Parse candidate list in real time
  const getCleanOptions = (raw: string): string[] => {
    return raw
      .split(/[\n,，]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  useEffect(() => {
    setCandidates(getCleanOptions(inpText));
  }, [inpText]);

  const loadPreset = () => {
    const classroom = DEFAULT_PRESETS.find((p) => p.id === 'classroom');
    if (classroom) {
      setInpText(classroom.items.join('\n'));
      setGroupedResults([]);
    }
  };

  const handleGroup = () => {
    const pool = [...candidates];
    if (pool.length === 0) {
      alert('請先輸入或載入分組成員名單！');
      return;
    }

    if (groupTarget < 1) {
      alert('設定之組數或人數必須大於 0 才可以喔！');
      return;
    }

    setIsGrouping(true);
    setGroupedResults([]);

    // Tick tick ticking sounds
    let step = 0;
    const interval = setInterval(() => {
      if (soundEnabled) {
        audioSynth.playTick(500 + step * 40, 0.03);
      }
      step++;
      if (step >= 12) {
        clearInterval(interval);

        // Shuffle the pool completely first
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const results: GroupResult[] = [];

        if (groupMode === 'byCount') {
          const numGroups = Math.min(groupTarget, shuffled.length);
          for (let g = 0; g < numGroups; g++) {
            results.push({
              groupName: `${PRESET_GROUPS[g] || `第 ${g + 1} 組`}`,
              members: []
            });
          }

          shuffled.forEach((name, i) => {
            const groupIndex = i % numGroups;
            results[groupIndex].members.push(name);
          });
        } else {
          const size = groupTarget;
          const numGroups = Math.ceil(shuffled.length / size);

          for (let g = 0; g < numGroups; g++) {
            const chunk = shuffled.slice(g * size, (g + 1) * size);
            results.push({
              groupName: `${PRESET_GROUPS[g] || `第 ${g + 1} 組`}`,
              members: chunk
            });
          }
        }

        setGroupedResults(results);
        setIsGrouping(false);
        if (soundEnabled) {
          audioSynth.playSuccess();
        }
      }
    }, 100);
  };

  const handleReset = () => {
    setInpText('野原新之助 (小新)\n風間徹\n櫻田妮妮\n佐藤正男\n阿呆\n野原廣志\n野原美冴\n野原向日葵\n野原小白 \n吉永綠\n松坂梅\n上尾真美');
    setGroupMode('byCount');
    setGroupTarget(3);
    setGroupedResults([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Parameters Controls */}
      <div className="lg:col-span-5 bg-white cartoon-border rounded-3xl p-5 cartoon-shadow space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            👥 雙葉幼稚園分組
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">匯入想要分組的名單，小新會幫大家分班喔！</p>
        </div>

        <div>
          <button
            type="button"
            onClick={loadPreset}
            disabled={isGrouping}
            className="w-full text-center text-xs bg-slate-50 border-2 border-dashed border-slate-900 hover:bg-shin-yellow py-2.5 rounded-xl text-slate-900 font-black transition-all disabled:opacity-40"
          >
            🏫 快速載入春日部防衛隊名單
          </button>
        </div>

        {/* Input Roster */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-600 block">
              ✍️ 待分組成員名單：
            </label>
            <span className="text-[10px] font-black bg-shin-yellow text-slate-900 px-2 py-0.5 rounded-full border-2 border-slate-900">
              目前 {candidates.length} 人
            </span>
          </div>
          <textarea
            rows={5}
            value={inpText}
            onChange={(e) => setInpText(e.target.value)}
            disabled={isGrouping}
            placeholder="請輸入名成員，每一行一位..."
            className="w-full bg-slate-50 border-3 border-slate-900 rounded-2xl p-3 text-xs font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-shin-yellow transition-all placeholder:text-slate-400 disabled:opacity-60"
          />
        </div>

        {/* Group Mode */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 block">📐 分組方式：</label>
          <div className="grid grid-cols-2 bg-slate-100 border-2 border-slate-900 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setGroupMode('byCount');
                setGroupTarget(3);
              }}
              disabled={isGrouping}
              className={`flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-bold transition-all ${
                groupMode === 'byCount'
                  ? 'bg-white border-2 border-slate-900 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 指定組數
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupMode('byMembers');
                setGroupTarget(4);
              }}
              disabled={isGrouping}
              className={`flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-bold transition-all ${
                groupMode === 'byMembers'
                  ? 'bg-white border-2 border-slate-900 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> 指定各組人數
            </button>
          </div>
        </div>

        {/* Input Target number */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 block">
            {groupMode === 'byCount' ? '🎯 設定預定分成幾組' : '🎯 設定每組幾個人'}
          </label>
          <div className="flex items-center bg-slate-50 border-3 border-slate-900 rounded-2xl overflow-hidden px-3 py-1">
            <input
              type="number"
              min={1}
              max={candidates.length || 10}
              value={groupTarget}
              onChange={(e) => setGroupTarget(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isGrouping}
              className="w-full bg-transparent border-none text-slate-950 font-black text-sm py-2 px-1 focus:outline-none focus:ring-0"
            />
            <span className="text-xs font-black text-slate-500 shrink-0">
              {groupMode === 'byCount' ? '組' : '人'}
            </span>
          </div>
        </div>

        {/* Group Trigger */}
        <button
          type="button"
          onClick={handleGroup}
          disabled={isGrouping || candidates.length === 0}
          className="w-full bg-shin-green hover:bg-emerald-400 active:translate-y-0.5 text-slate-900 py-3.5 px-4 rounded-2xl font-black text-sm border-3 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGrouping ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-900 border-t-white rounded-full animate-spin" />
              <span>春日部隨機分配中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-900" />
              <span>立即隨機分配！</span>
            </>
          )}
        </button>

        <div className="pt-1.5 border-t-2 border-dashed border-slate-200 flex justify-between items-center">
          <button
            onClick={handleReset}
            disabled={isGrouping}
            className="text-xs font-black text-slate-500 hover:text-slate-850 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> 重置雙葉班名冊
          </button>
        </div>
      </div>

      {/* Grouping layout Right column */}
      <div className="lg:col-span-7 bg-shin-cream border-4 border-slate-900 rounded-3xl p-6 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden cartoon-shadow">
        {isGrouping ? (
          <div className="text-center space-y-6">
            {/* Group shaking spheres */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl animate-bounce">🧒</span>
              <span className="text-3xl animate-pulse">🐶</span>
              <span className="text-3xl animate-bounce">🐽</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-850 animate-pulse">
                🎲 正在打包春日部成員、平均分配在不同班級中...
              </p>
              <p className="text-[10px] text-slate-500 font-bold">小新在認真分配名冊，吉永老師在旁邊看喔！</p>
            </div>
          </div>
        ) : groupedResults.length > 0 ? (
          <div className="w-full space-y-5">
            <div className="text-center">
              <p className="text-[10px] font-black text-shin-green tracking-wider uppercase mb-1">
                GROUPS RECONCEIVED SUCCESSFULLY
              </p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                🎉 大 功 告 成！雙 葉 分 組 名 單
              </h3>
            </div>

            {/* Main Cards Output scrollable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[290px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-300">
              {groupedResults.map((gp, i) => (
                <div
                  key={i}
                  className="bg-white border-3 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden"
                >
                  <div className="absolute right-3 top-3 text-[10px] text-slate-600 font-black bg-shin-yellow border-2 border-slate-900 px-2 py-0.5 rounded-full">
                    {gp.members.length} 人
                  </div>
                  <h4 className="text-xs font-black text-slate-850 border-b-2 border-slate-100 pb-2 mb-2">
                    {gp.groupName}
                  </h4>
                  {/* Members list */}
                  <div className="flex flex-wrap gap-1.5">
                    {gp.members.map((name, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-50 text-slate-900 border-2 border-slate-900 font-bold px-2 py-1 rounded-xl shadow-2xs"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-1">
              <button
                onClick={() => setGroupedResults([])}
                className="text-xs font-black text-slate-400 hover:text-slate-850 flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> 重新再次隨機拆組
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xs space-y-4">
            <div className="w-16 h-16 bg-white border-3 border-slate-900 text-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <Group className="w-8 h-8 text-shin-green" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-850">吉永老師：「準備隨機分組名單囉！」</h4>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed font-sans">
                可以用於課堂組隊、小遊戲分組對抗，或是春日部防衛隊秘密基地分配。
                設定好左右兩側參數後，按「立即隨機分配！」即可看結果！
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
