import React, { useEffect, useState } from 'react';
import { Database, HardDrive, Cpu, Trash2, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface StorageStats {
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
  unallocatedMB: number;
}

export default function StorageInspector() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [swActive, setSwActive] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [localStorageCount, setLocalStorageCount] = useState<number>(0);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  useEffect(() => {
    // 1. Calculate standard storage estimate
    updateStorageDetails();

    // 2. Discover SW active states
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setSwActive(!!reg.active);
          setSwRegistration(reg);
        }
      });
    }

    // 3. Count local storage keys
    setLocalStorageCount(localStorage.length);
  }, []);

  const updateStorageDetails = () => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const usageBytes = estimate.usage || 0;
        const quotaBytes = estimate.quota || 1; // prevent divide-by-zero
        
        const usedMB = parseFloat((usageBytes / (1024 * 1024)).toFixed(2));
        const quotaMB = parseFloat((quotaBytes / (1024 * 1024)).toFixed(2));
        const percentUsed = parseFloat(((usageBytes / quotaBytes) * 100).toFixed(4));
        const unallocatedMB = parseFloat(((quotaBytes - usageBytes) / (1024 * 1024)).toFixed(2));

        setStats({
          usedMB,
          quotaMB,
          percentUsed: Math.max(percentUsed, 0.001), // visibility helper
          unallocatedMB
        });
      });
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear localStorage
      localStorage.clear();
      setLocalStorageCount(0);

      // Clear all cache storage keys
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Re-query details
      setTimeout(() => {
        updateStorageDetails();
        setIsClearing(false);
        // Dispatch custom reload event or just update state
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error('Error resetting storage layers:', err);
      setIsClearing(false);
    }
  };

  return (
    <div id="pwa-diagnostic-center" className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h2 className="font-sans font-semibold text-slate-100 tracking-tight text-lg">Хранилище и Сервис-Воркер</h2>
        </div>
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95 disabled:opacity-50 text-xs font-medium rounded-lg border border-rose-500/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isClearing ? 'Очистка...' : 'Сбросить кэш'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Storage Statistics */}
        <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-200">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">Квота локального кэша PWA</span>
          </div>

          {stats ? (
            <div className="space-y-3.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Использовано: <strong className="text-slate-200 font-mono text-xs">{stats.usedMB} MB</strong></span>
                <span>Доступно: <strong className="text-slate-200 font-mono text-xs">{stats.quotaMB.toLocaleString()} MB</strong></span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(stats.percentUsed * 10, 0.5), 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                <span>Доля использования: {stats.percentUsed.toFixed(4)}%</span>
                <span className="text-cyan-400 font-medium">Гарантированно оффлайн</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500 font-mono">
              Расчет объема свободного места...
            </div>
          )}

          <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
            <span className="text-slate-400">Переменные в LocalStorage:</span>
            <span className="font-mono text-indigo-300 font-bold">{localStorageCount} шт.</span>
          </div>
        </div>

        {/* Right Card: Service Worker Engine States */}
        <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-200">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium">Статус фоновых процессов</span>
          </div>

          <div className="space-y-3">
            {/* SW Active Status Row */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400">Сервис-Воркер (Service Worker):</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${swActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                <span className={`font-mono text-[11px] uppercase font-bold ${swActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {swActive ? 'АКТИВЕН (OFFLINE READY)' : 'НЕ СВЯЗАН'}
                </span>
              </div>
            </div>

            {/* Scope info */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-slate-900/40">
              <span className="text-slate-400">Область видимости (Scope):</span>
              <span className="font-mono text-[10px] text-slate-300 select-all max-w-[200px] truncate" title={swRegistration?.scope || 'N/A'}>
                {swRegistration ? swRegistration.scope.replace(window.location.origin, '') : '/ (default)'}
              </span>
            </div>

            {/* Offline Shield Indicator */}
            <div className="mt-2.5 p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Защищенное Окружение</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Сервис-воркер перехватывает сетевые запросы и мгновенно возвращает кэшированные копии страниц при обрыве интернет-соединения.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
