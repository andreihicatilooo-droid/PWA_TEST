import React, { useEffect, useState } from 'react';
import { Download, Monitor, Phone, Share, Compass, CheckCircle, Info, Layers, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InstallPrompterProps {
  onInstallSuccess: () => void;
}

export default function InstallPrompter({ onInstallSuccess }: InstallPrompterProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState<'safari' | 'chrome' | 'firefox' | 'other'>('other');
  const [osType, setOsType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    // 1. Detect if already installed (standalone mode)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // 2. Identify browser and OS environments to assist step-by-step
    const ua = window.navigator.userAgent.toLowerCase();
    
    // OS detection
    if (/iphone|ipad|ipod/.test(ua)) {
      setOsType('ios');
    } else if (/android/.test(ua)) {
      setOsType('android');
    } else {
      setOsType('desktop');
    }

    // Browser detection
    if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
      setBrowserType('safari');
    } else if (ua.includes('firefox')) {
      setBrowserType('firefox');
    } else if (ua.includes('chrome') || ua.includes('chromium') || ua.includes('edg')) {
      setBrowserType('chrome');
    }

    // 3. Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent standard mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('[PWA Installer] beforeinstallprompt event captured.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Capture standard success track event
    const handleAppInstalled = () => {
      console.log('[PWA Installer] appinstalled event received!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      onInstallSuccess();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstallSuccess]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install banner prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA Installer] User selection outcome: ${outcome}`);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      onInstallSuccess();
    }
    
    // Clear deferred prompt so it can be collected by garbage collector
    setDeferredPrompt(null);
  };

  return (
    <div id="pwa-install-section" className="bg-zinc-card p-6 border border-zinc-800 shadow-[4px_4px_0px_#000000] overflow-hidden relative rounded-none">
      
      {/* Top Main Status Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-neon" />
          <h2 className="font-display font-extrabold text-white uppercase italic tracking-tight text-lg">Установка Приложения (PWA)</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black border border-zinc-800 self-start sm:self-auto">
          <span className={`w-2.5 h-2.5 ${isInstalled ? 'bg-green-neon animate-pulse' : isInstallable ? 'bg-amber-400' : 'bg-zinc-500'}`}></span>
          <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-widest">
            {isInstalled ? 'STANDALONE ACTIVE' : isInstallable ? 'STABLE CORE AVAILABLE' : 'STANDARD BROWSER MODE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Info Column */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <p className="text-sm text-zinc-300 leading-relaxed font-semibold">
            Это полноценное прогрессивное веб-приложение (<strong className="text-green-neon font-black">PWA</strong>). 
            Вы можете установить его прямо из браузера на рабочий стол вашего компьютера, iPhone, iPad или Android-смартфона.
          </p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-neon flex-shrink-0" />
              <span className="font-bold">Быстрый запуск с главного экрана</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-neon flex-shrink-0" />
              <span className="font-bold">Полная поддержка без интернета</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-neon flex-shrink-0" />
              <span className="font-bold">Автономный режим без рамок</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-neon flex-shrink-0" />
              <span className="font-bold">Энергоэффективное кэширование</span>
            </li>
          </ul>
        </div>

        {/* Action / Trigger Column */}
        <div className="lg:col-span-5 flex flex-col justify-center items-stretch sm:items-center lg:items-stretch bg-black p-5 border border-zinc-800 rounded-none">
          {isInstalled ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-neon/10 text-green-neon rounded-full flex items-center justify-center mx-auto mb-3 border border-green-neon/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Приложение уже установлено!</h3>
              <p className="text-[11px] text-zinc-400 mt-1.5 font-medium leading-relaxed">Вы используете независимую локальную PWA-сборку с поддержкой фонового Воркера.</p>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3 text-center sm:text-left lg:text-left w-full">
              <button
                id="btn-pwa-install"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-6 bg-green-neon text-black hover:bg-white hover:text-black font-black text-xs uppercase tracking-widest transition-none cursor-pointer border-none shadow-[2px_2px_0px_#ffffff] active:translate-y-0.5"
              >
                Установить в 1 клик
              </button>
              <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                <Compass className="w-3.5 h-3.5 text-green-neon" />
                <span>БРАУЗЕР ГОТОВ К ИНТЕГРАЦИИ</span>
              </div>
            </div>
          ) : (
            /* Custom Guide depending on OS and Browser */
            <div className="space-y-3 w-full text-left">
              {osType === 'ios' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Инструкция для iOS (Safari)</span>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-2 bg-zinc-card p-3 border border-zinc-800 leading-relaxed font-semibold">
                    <div className="flex gap-2.5 items-start">
                      <span className="w-4.5 h-4.5 bg-green-neon text-black flex items-center justify-center font-black text-[10px] shrink-0">1</span>
                      <span>Нажмите на кнопку <strong className="text-white">«Поделиться»</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-green-neon" /> в Safari.</span>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <span className="w-4.5 h-4.5 bg-green-neon text-black flex items-center justify-center font-black text-[10px] shrink-0">2</span>
                      <span>Выберите пункт <strong className="text-white">«На экран "Домой"»</strong> для инсталляции.</span>
                    </div>
                  </div>
                </div>
              ) : browserType === 'safari' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-neon">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Инструкция для macOS Safari</span>
                  </div>
                  <div className="text-xs text-zinc-300 bg-zinc-card p-3 border border-zinc-800 leading-relaxed font-semibold">
                    <span>Нажмите <strong className="text-white">«Файл»</strong> {`->`} <strong className="text-white">«Добавить в Dock...»</strong> для установки.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <Info className="w-3.5 h-3.5 text-green-neon" />
                    <span>КАК ЗАПУСТИТЬ УСТАНОВКУ:</span>
                  </div>
                  <div className="text-xs text-zinc-300 space-y-1 bg-zinc-900/60 p-3 border border-zinc-800/80 leading-relaxed">
                    <p className="font-bold text-zinc-200">В адресной строке веб-приложения:</p>
                    <p className="text-zinc-400 mt-1">
                      Кликните по иконке <strong className="text-white">«Установить приложение»</strong> (монитор со стрелкой или знак «+») в правом углу адресной строки.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
