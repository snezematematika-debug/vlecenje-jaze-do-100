import React from 'react';
import { GameSettings } from '../types';
import { X, Volume2, VolumeX, Calculator, Swords, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-xl text-white">
              Поставки за час
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Operations choice */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Математички операции:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'both', label: 'Множење и делење (до 100)' },
                { id: 'multiplication', label: 'Само множење (×)' },
                { id: 'division', label: 'Само делење (:)' },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() =>
                    onSaveSettings({
                      ...settings,
                      operationMode: op.id as 'both' | 'multiplication' | 'division',
                    })
                  }
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    settings.operationMode === op.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total tasks count */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Број на задачи во натпреварот:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() =>
                    onSaveSettings({
                      ...settings,
                      totalTasks: count,
                    })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    settings.totalTasks === count
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-1 ring-sky-400/40'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {count} задачи {count === 20 ? '(стандардно)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Sound switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <span className="text-sm font-semibold text-slate-200">
                Звучни ефекти за паметна табла
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                onSaveSettings({
                  ...settings,
                  soundEnabled: !settings.soundEnabled,
                })
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.soundEnabled
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {settings.soundEnabled ? 'Вклучено' : 'Исклучено'}
            </button>
          </div>

          {/* Quick Classroom Guide */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-amber-400" /> Правила на симултаната трка:
            </span>
            <p>
              • <b>Истовремено решавање:</b> Двата тима решаваат на таблата истовремено без чекање еден на друг.
            </p>
            <p>
              • <b>Редење на задачите:</b> Прво се решаваат редовните 20 задачи.
            </p>
            <p>
              • <b>Различни задачи:</b> Синиот и Црвениот тим добиваат различни задачи (пр. првата задача на сините е различна од првата на црвените) за фер натпревар без препишување.
            </p>
            <p>
              • <b>Поправка на грешки:</b> Штом ќе поминат сите 20, автоматски се редат оние што тимот ги згрешил, сè додека не се решат точно!
            </p>
            <p>
              • <b>Победник:</b> Тимот кој за најкратко време ќе ги реши точно сите 20 задачи.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-5">
          <button
            type="button"
            onClick={() => {
              onResetGame();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Ресетирај игра
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Во ред
          </button>
        </div>
      </div>
    </div>
  );
};
