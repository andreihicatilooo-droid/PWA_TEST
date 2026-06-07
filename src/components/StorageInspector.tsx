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
    <div id="pwa-diagnostic-center" className="bg-zinc-card p-6 border border-zinc-800 shadow-[4px_4px_0px_#000000] overflow-hidden relative rounded-none text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-zinc-800 gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-green-neon" />
          <h2 className="font-display font-black text-lg text-white uppercase italic tracking-tight">Хранилище и Сервис-Воркер</h2>
        </div>
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-black disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-none cursor-pointer rounded-none border border-rose-500/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isClearing ? 'ОЧИСТКА...' : 'СБРОСИТЬ КЭШ'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Storage Statistics */}
        <div className="space-y-4 bg-black p-5 border border-zinc-900 rounded-none">
          <div className="flex items-center gap-2 text-white">
            <HardDrive className="w-4 h-4 text-green-neon" />
            <span className="text-[11px] font-mono font-black uppercase tracking-wider">КВОТА ЛОКАЛЬНОГО КЭША PWA</span>
          </div>

          {stats ? (
            <div className="space-y-3.5">
              <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                <span>Использовано: <strong className="text-white font-mono">{stats.usedMB} MB</strong></span>
                <span>Доступно: <strong className="text-white font-mono">{stats.quotaMB.toLocaleString()} MB</strong></span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-900 h-2.5 rounded-none overflow-hidden p-0.5 border border-zinc-850">
                <div 
                  className="bg-green-neon h-1 rounded-none transition-all duration-500 shadow-[0_0_8px_#00FF66]"
                  style={{ width: `${Math.min(Math.max(stats.percentUsed * 10, 0.5), 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                <span>Доля использования: {stats.percentUsed.toFixed(4)}%</span>
                <span className="text-green-neon">ГАРАНТИРОВАННО ОФФЛАЙН</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-zinc-550 font-mono font-bold uppercase tracking-wider">
              Расчет объема свободного места...
            </div>
          )}

          <div className="pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-zinc-500">Переменные в LocalStorage:</span>
            <span className="font-mono text-green-neon font-black">{localStorageCount} шт.</span>
          </div>
        </div>

        {/* Right Card: Service Worker Engine States */}
        <div className="space-y-4 bg-black p-5 border border-zinc-900 rounded-none">
          <div className="flex items-center gap-2 text-white">
            <Cpu className="w-4 h-4 text-green-neon" />
            <span className="text-[11px] font-mono font-black uppercase tracking-wider">СТАТУС ФОНОВЫХ ПРОЦЕССОВ</span>
          </div>

          <div className="space-y-3.5">
            {/* SW Active Status Row */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Служба (Service Worker):</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 ${swActive ? 'bg-green-neon animate-pulse' : 'bg-rose-500'}`}></span>
                <span className={`font-mono text-[10px] uppercase font-black tracking-widest ${swActive ? 'text-green-neon' : 'text-rose-400'}`}>
                  {swActive ? 'READY STANDBY' : 'NOT LINKED'}
                </span>
              </div>
            </div>

            {/* Scope info */}
            <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-900">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Сегмент кэша (Scope):</span>
              <span className="font-mono text-[10px] font-bold text-zinc-300 select-all max-w-[180px] truncate" title={swRegistration?.scope || 'N/A'}>
                {swRegistration ? swRegistration.scope.replace(window.location.origin, '') : '/ (default)'}
              </span>
            </div>

            {/* Offline Shield Indicator */}
            <div className="mt-2.5 p-3 bg-green-neon/5 border border-green-neon/15 flex items-start gap-2.5 rounded-none">
              <ShieldCheck className="w-5 h-5 text-green-neon shrink-0 mt-0.5" />
              <div className="text-left">
                <h4 className="text-[9px] font-extrabold text-green-neon uppercase tracking-widest">Бесшовная Изоляция</h4>
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed mt-1">
                  Абсолютный перехват сетевых пакетов на лету. Возвращается моментальный ответ со встроенными ассетами из кэша.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
