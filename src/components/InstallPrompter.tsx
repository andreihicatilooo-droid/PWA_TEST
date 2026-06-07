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
    <div id="pwa-install-section" className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Decorative colored glow bubble */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Top Main Status Tag */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="font-sans font-semibold text-slate-100 tracking-tight text-lg">Установка Приложения (PWA)</h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700">
          <span className={`w-2.5 h-2.5 rounded-full ${isInstalled ? 'bg-emerald-400' : isInstallable ? 'bg-amber-400' : 'bg-blue-400 animate-pulse'}`}></span>
          <span className="text-[11px] font-mono font-medium text-slate-300">
            {isInstalled ? 'УСТАНОВЛЕНО (Standalone)' : isInstallable ? 'ДОСТУПНО ДЛЯ УСТАНОВКИ' : 'ОБЫЧНЫЙ ВЕБ-РЕЖИМ'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Info Column */}
        <div className="lg:col-span-7 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            Это полноценное прогрессивное веб-приложение (<strong className="text-indigo-300 font-medium">PWA</strong>). 
            Вы можете установить его прямо из браузера на рабочий стол вашего компьютера, iPhone, iPad или Android-смартфона.
          </p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Быстрый запуск с главного экрана</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Полноценная работа без интернета</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Автопусковой режим без рамок браузера</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Автосохранение кэша в локальной памяти</span>
            </li>
          </ul>
        </div>

        {/* Action / Trigger Column */}
        <div className="lg:col-span-5 flex flex-col justify-center items-stretch sm:items-center lg:items-stretch bg-slate-950/40 p-4 rounded-xl border border-slate-800/85">
          {isInstalled ? (
            <div className="text-center py-3 px-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Приложение уже установлено!</h3>
              <p className="text-xs text-slate-400 mt-1">Вы используете автономную PWA-версию с поддержкой оффлайн режима.</p>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3 text-center sm:text-left lg:text-left w-full">
              <button
                id="btn-pwa-install"
                onClick={handleInstallClick}
                className="w-full py-3 px-5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Установить в 1 клик
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>Браузер готов к полной установке</span>
              </div>
            </div>
          ) : (
            /* Custom Guide depending on OS and Browser */
            <div className="space-y-3 w-full">
              {osType === 'ios' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Инструкция для iOS (Safari)</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                    <div className="flex gap-2 items-start">
                      <span className="w-4 h-4 bg-indigo-500/20 text-indigo-300 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">1</span>
                      <span>Нажмите на кнопку <strong className="text-white">«Поделиться»</strong> <Share className="w-3.5 h-3.5 inline mx-0.5" /> в панели Safari.</span>
                    </div>
                    <div className="flex gap-2 items-start mt-1">
                      <span className="w-4 h-4 bg-indigo-500/20 text-indigo-300 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">2</span>
                      <span>Выберите пункт <strong className="text-white">«На экран "Домой"»</strong>.</span>
                    </div>
                  </div>
                </div>
              ) : browserType === 'safari' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Инструкция для macOS Safari</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                    <span>Нажмите <strong className="text-white">«Файл»</strong> {`->`} <strong className="text-white">«Добавить в Dock...»</strong> для установки приложения на ваш Mac.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Как запустить установку:</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                    <p className="font-medium text-slate-200">В адресной строке сверху:</p>
                    <p className="text-slate-400 mt-0.5">
                      Кликните по иконке <strong className="text-slate-200">«Установить приложение»</strong> (монитор со стрелкой или знак «+») в правом углу адресной строки вашего веб-браузера.
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
