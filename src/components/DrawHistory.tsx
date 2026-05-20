import React from 'react';
import { Trash2, Calendar, Clipboard, Download, HelpCircle, Layers, Award } from 'lucide-react';
import { WinnerHistory } from '../types';

interface DrawHistoryProps {
  history: WinnerHistory[];
  onClearHistory: () => void;
}

export default function DrawHistory({ history, onClearHistory }: DrawHistoryProps) {
  
  const handleCopy = (items: string[]) => {
    try {
      navigator.clipboard.writeText(items.join('\n'));
      alert('已複製結果名單至剪貼簿！');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href",     dataStr);
      downloadAnchor.setAttribute("download", `lucky-draw-history-${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('匯出時發生問題');
    }
  };

  const formatMode = (mode: string) => {
    switch (mode) {
      case 'names': return '📋 名單抽籤';
      case 'numbers': return '🔢 數字抽籤';
      case 'wheel': return '🎯 幸運轉盤';
      case 'groups': return '👥 隨機分組';
      default: return '🎰 抽籤';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <Award className="w-5 h-5 text-indigo-500" /> 近期抽出紀錄 ({history.length})
          </h2>
          <p className="text-[11px] text-slate-400">目前本機瀏覽器的歷史得獎紀錄留存</p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              title="匯出紀錄"
              className="p-1.5 rounded-xl hover:bg-slate-50 border border-slate-100/50 text-slate-500 hover:text-indigo-600 transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearHistory}
              title="清除全部"
              className="p-1.5 rounded-xl hover:bg-rose-50 border border-slate-100/50 text-slate-400 hover:text-rose-600 transition-all font-semibold"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-8 text-center text-slate-400 max-w-sm mx-auto space-y-1.5">
          <Calendar className="w-7 h-7 stroke-1 text-slate-300 mx-auto" />
          <p className="text-xs font-medium">尚無抽籤紀錄</p>
          <p className="text-[10px] leading-relaxed">每一次點按抽籤或滾動出獎後，得獎者明細將會自動保存於此。</p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
          {history.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 space-y-2 hover:border-slate-200/80 hover:bg-slate-50 transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg">
                  {formatMode(log.mode)}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Contest outcome content */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {log.result.map((res, idx) => (
                      <span
                        key={idx}
                        className="inline-block text-xs font-black text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-2xs"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                  {log.title && (
                    <p className="text-[10px] text-slate-400 font-medium">抽點類別：{log.title}</p>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(log.result)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 shrink-0 transition-colors"
                  title="複製得獎者"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
