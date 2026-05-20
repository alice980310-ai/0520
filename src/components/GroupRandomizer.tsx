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
  '第一組', '第二組', '第三組', '第四組', '第五組', '第六組', '第七組', '第八組', '第九組', '第十組'
];

export default function GroupRandomizer({ soundEnabled }: GroupRandomizerProps) {
  const [inpText, setInpText] = useState(
    '陳大東\n李小華\n張美麗\n王偉強\n林志玲\n周杰倫\n蔡依林\n張惠妹\n劉德華\n梁朝偉\n金城武\n彭于晏'
  );
  const [groupMode, setGroupMode] = useState<'byCount' | 'byMembers'>('byCount');
  const [groupTarget, setGroupTarget] = useState<number>(3); // divide into 3 groups / or 3 members per group
  
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
      alert('設定之組數或人數必須大於 0！');
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
          // Rule: divide into exact groupTarget counts
          const numGroups = Math.min(groupTarget, shuffled.length);
          for (let g = 0; g < numGroups; g++) {
            results.push({
              groupName: `✨ ${PRESET_GROUPS[g] || `第 ${g + 1} 組`}`,
              members: []
            });
          }

          // Distribute names round-robin to keep sizes as equal as possible
          shuffled.forEach((name, i) => {
            const groupIndex = i % numGroups;
            results[groupIndex].members.push(name);
          });
        } else {
          // Rule: specify groupTarget size per group
          const size = groupTarget;
          const numGroups = Math.ceil(shuffled.length / size);

          for (let g = 0; g < numGroups; g++) {
            const chunk = shuffled.slice(g * size, (g + 1) * size);
            results.push({
              groupName: `✨ ${PRESET_GROUPS[g] || `第 ${g + 1} 組`}`,
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
    setInpText('陳大東\n李小華\n張美麗\n王偉強\n林志玲\n周杰倫\n蔡依林\n張惠妹\n劉德華\n梁朝偉\n金城武\n彭于晏');
    setGroupMode('byCount');
    setGroupTarget(3);
    setGroupedResults([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Parameters Controls */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-medium text-slate-800 tracking-tight flex items-center gap-1.5">
            👥 隨機分組設定
          </h2>
          <p className="text-xs text-slate-400 mt-1">匯入團隊或名單，自動產出最平均的各組分組</p>
        </div>

        {/* Presets */}
        <div>
          <button
            type="button"
            onClick={loadPreset}
            disabled={isGrouping}
            className="w-full text-center text-xs bg-slate-50 border border-dashed border-slate-200 hover:bg-slate-100/60 py-2.5 rounded-xl text-slate-700 font-semibold transition-all disabled:opacity-40"
          >
            🏫 快速載入常用課堂名單
          </button>
        </div>

        {/* Input Roster */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 block">
              ✍️ 待分組成員名冊
            </label>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              目前 {candidates.length} 人
            </span>
          </div>
          <textarea
            rows={5}
            value={inpText}
            onChange={(e) => setInpText(e.target.value)}
            disabled={isGrouping}
            placeholder="請輸入名成員，每一行一位..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-sans placeholder:text-slate-400 disabled:opacity-60"
          />
        </div>

        {/* Group Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 block">📐 分組機制</label>
          <div className="grid grid-cols-2 bg-slate-100 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setGroupMode('byCount');
                setGroupTarget(3);
              }}
              disabled={isGrouping}
              className={`flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-bold transition-all ${
                groupMode === 'byCount'
                  ? 'bg-white shadow-xs text-indigo-600'
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
                  ? 'bg-white shadow-xs text-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> 指定各組人數
            </button>
          </div>
        </div>

        {/* Input Target number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">
            {groupMode === 'byCount' ? '🎯 設定預定分成幾組' : '🎯 設定每組幾個人'}
          </label>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden px-3 py-1">
            <input
              type="number"
              min={1}
              max={candidates.length || 10}
              value={groupTarget}
              onChange={(e) => setGroupTarget(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isGrouping}
              className="w-full bg-transparent border-none text-slate-800 font-bold text-sm py-2 px-1 focus:outline-none focus:ring-0"
            />
            <span className="text-xs font-semibold text-slate-400 shrink-0">
              {groupMode === 'byCount' ? '組' : '人'}
            </span>
          </div>
        </div>

        {/* Group Trigger */}
        <button
          type="button"
          onClick={handleGroup}
          disabled={isGrouping || candidates.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGrouping ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>智能隨機拆組中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white animate-pulse" />
              <span>立即隨機分組</span>
            </>
          )}
        </button>

        <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={handleReset}
            disabled={isGrouping}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100/50 transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> 重設名冊
          </button>
        </div>
      </div>

      {/* Grouping layout Right column */}
      <div className="lg:col-span-7 bg-slate-50 border border-slate-100/50 rounded-3xl p-6 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
        {isGrouping ? (
          <div className="text-center space-y-6">
            {/* Group shaking spheres */}
            <div className="flex items-center justify-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-400 animate-ping" />
              <span className="w-8 h-8 rounded-full bg-pink-400 animate-bounce" />
              <span className="w-6 h-6 rounded-full bg-emerald-400 animate-ping" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700 animate-pulse">
                🎲 正在執行最優隨機平均分組...
              </p>
              <p className="text-xs text-slate-400">系統正在過濾餘數、建立最高熵值分配</p>
            </div>
          </div>
        ) : groupedResults.length > 0 ? (
          <div className="w-full space-y-5">
            <div className="text-center">
              <p className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">
                GROUPS RECONCEIVED SUCCESSFULLY
              </p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                🎉 隨 機 分 組 表
              </h3>
            </div>

            {/* Main Cards Output scrollable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[290px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
              {groupedResults.map((gp, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs relative overflow-hidden"
                >
                  <div className="absolute right-3 top-3.5 text-xs text-slate-400 font-mono font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                    {gp.members.length} 人
                  </div>
                  <h4 className="text-sm font-bold text-indigo-700 tracking-wide border-b border-indigo-50/60 pb-2 mb-2">
                    {gp.groupName}
                  </h4>
                  {/* Members list */}
                  <div className="flex flex-wrap gap-1.5">
                    {gp.members.map((name, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-50 text-slate-800 border border-slate-100/50 font-medium px-2 py-1 rounded-xl shadow-2xs"
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
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-slate-200/50 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> 重新排序分組
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-xs space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 border border-slate-200/50 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Group className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-700">準備隨機分組名冊？</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                可用於分組討論、團隊競賽、大活動的破冰桌次隨機分配。
                設定好參數後點按「隨機分組」即時產出。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
