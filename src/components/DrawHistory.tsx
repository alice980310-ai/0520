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
      case 'wheel': return '🎯 幸運輪盤';
      case 'groups': return '👥 隨機分組';
      default: return '🎰 抽籤';
    }
  };

  return (
    <div className="bg-white cartoon-border rounded-3xl p-5 cartoon-shadow space-y-4">
      <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-slate-200">
        <div>
          <h2 className="text-base font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            <Award className="w-5 h-5 text-shin-red" strokeWidth={3} /> 幼稚園得獎點點名布告欄 ({history.length})
          </h2>
          <p className="text-[11px] text-slate-505 font-bold">歷史抽取結果在關閉網頁前都會幫你留著唷！</p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              title="匯出紀錄"
              className="p-1.5 rounded-xl hover:bg-shin-yellow border-2 border-slate-900 text-slate-900 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearHistory}
              title="清除全部"
              className="p-1.5 rounded-xl hover:bg-shin-red border-2 border-slate-900 text-slate-900 transition-all font-semibold shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-8 text-center text-slate-400 max-w-sm mx-auto space-y-1.5">
          <Calendar className="w-7 h-7 stroke-2 text-slate-300 mx-auto" />
          <p className="text-xs font-black text-slate-400">布告欄上空空的～</p>
          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
            每一次進行「動感轉轉盤」、「點兵抽籤」或「座號搖號」後，得獎者小檔案就會自動釘在這裡唷！
          </p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-300">
          {history.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-3.5 space-y-2 hover:bg-shin-cream transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-950 bg-shin-yellow border-2 border-slate-900 px-2 py-0.5 rounded-lg shadow-sm">
                  {formatMode(log.mode)}
                </span>
                <span className="text-[10px] font-black text-slate-500 flex items-center gap-1 font-mono">
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
                        className="inline-block text-xs font-black text-slate-900 bg-white border-2 border-slate-950 px-2 py-1 rounded-xl shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                  {log.title && (
                    <p className="text-[10px] text-slate-500 font-bold">主題：{log.title}</p>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(log.result)}
                  className="p-1.5 rounded-lg border-2 border-slate-900 hover:bg-shin-yellow text-slate-900 shrink-0 transition-colors shadow-sm"
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

