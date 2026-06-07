import React, { useState, useEffect } from 'react';
import { 
  PwaTask, 
  PwaNote 
} from './types';
import InstallPrompter from './components/InstallPrompter';
import StorageInspector from './components/StorageInspector';
import TaskList from './components/TaskList';
import NoteHub from './components/NoteHub';
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  Sparkles, 
  Grid, 
  Info, 
  HelpCircle, 
  Layers, 
  Volume2, 
  VolumeX, 
  Share2, 
  ArrowRight, 
  Laptop,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Key names for storage persistence
const LOCAL_STORAGE_TASKS_KEY = 'pwa_studio_tasks';
const LOCAL_STORAGE_NOTES_KEY = 'pwa_studio_notes';

// Seed initial tasks if storage is empty
const INITIAL_TASKS: PwaTask[] = [
  {
    id: '1',
    title: 'Установить приложение PWA Studio на устройство',
    description: 'Нажмите кнопку «Установить» в плавающей панели вверху страницы.',
    completed: false,
    priority: 'high',
    createdAt: Date.now() - 3600000
  },
  {
    id: '2',
    title: 'Проверить работу оффлайн режима',
    description: 'Отключите интернет и обновите вкладку. Приложение запустится мгновенно за счет Сервис-Воркера!',
    completed: false,
    priority: 'medium',
    createdAt: Date.now() - 1800000
  }
];

// Seed initial notes if storage is empty
const INITIAL_NOTES: PwaNote[] = [
  {
    id: '1',
    title: 'Особенности прогрессивных веб-приложений',
    content: 'PWA заменяет нативные мобильные приложения благодаря использованию современных API:\n1. Service Workers (Офлайн кэш)\n2. Web App Manifest (Интеграция с рабочим столом iOS/Android)\n3. Cache API (Быстрый старт)\n4. Web Push Notifications\n5. Local Storage (Локальная база данных)',
    tag: 'Технологии',
    color: 'border-l-indigo-500 bg-indigo-500/5',
    updatedAt: Date.now()
  }
];

export default function App() {
  const [tasks, setTasks] = useState<PwaTask[]>([]);
  const [notes, setNotes] = useState<PwaNote[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'workspace' | 'diagnostics'>('workspace');
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // 1. Initial Load & Hydrate
  useEffect(() => {
    const cachedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    const cachedNotes = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);

    if (cachedTasks) {
      try {
        setTasks(JSON.parse(cachedTasks));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
    }

    if (cachedNotes) {
      try {
        setNotes(JSON.parse(cachedNotes));
      } catch (e) {
        setNotes(INITIAL_NOTES);
      }
    } else {
      setNotes(INITIAL_NOTES);
    }

    // 2. Network connection change listeners
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Интернет восстановлен! Подключение стабильно.');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Отключено от сети! Приложение перешло в оффлайн-режим.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => {
      setNotifMessage(null);
    }, 4500);
  };

  const handleTasksChange = (updatedTasks: PwaTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updatedTasks));
  };

  const handleNotesChange = (updatedNotes: PwaNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(updatedNotes));
  };

  const notifyOnInstallStateChange = () => {
    showNotification('Поздравляем! PWA-приложение успешно установлено на устройство.');
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Radial Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[500px] bg-gradient-to-b from-indigo-900/15 via-transparent to-transparent blur-3xl pointer-events-none z-0"></div>

      {/* Floating System Connection Status Toast */}
      <AnimatePresence>
        {notifMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-5 py-3 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-2xl flex items-center gap-3 w-[90%] max-w-sm sm:max-w-md"
            id="pwa-toast-alert"
          >
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 text-left">{notifMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-screen justify-between">
        
        {/* Main Header Row */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Logo Layout inside application */}
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-indigo-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7 text-white">
                <path d="M190 180 L256 140 L322 180 L322 332 L256 372 L190 332 Z" fill="currentColor" fillOpacity="0.2" />
                <rect x="240" y="190" width="32" height="130" rx="16" fill="currentColor" />
                <rect x="190" y="230" width="32" height="90" rx="16" fill="currentColor" opacity="0.8" />
                <rect x="290" y="210" width="32" height="110" rx="16" fill="currentColor" opacity="0.8" />
                <circle cx="256" cy="140" r="16" fill="#ffffff" />
              </svg>
            </div>
            
            <div className="text-left">
              <h1 className="font-sans font-extrabold text-xl tracking-tight text-slate-50 bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                PWA Studio
              </h1>
              <p className="text-xs text-slate-400 font-mono">WORKSPACE • OFFLINE ENVIRONMENT</p>
            </div>
          </div>

          {/* Quick Network Status & Tabs toggling */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Network Indicator Bubble */}
            <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all ${
              isOnline 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">В сети (Online)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">Оффлайн (Offline)</span>
                </>
              )}
            </div>

            {/* Dashboard Workspace Toggle Controls */}
            <div className="bg-slate-900/60 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'workspace' 
                    ? 'bg-indigo-500 text-white font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Рабочая панель
              </button>
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'diagnostics' 
                    ? 'bg-indigo-500 text-white font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Диагностика PWA
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic workspace main layout views */}
        <main className="flex-1 space-y-6">
          
          {/* Always Present: The Installer guidance panel */}
          <InstallPrompter onInstallSuccess={notifyOnInstallStateChange} />

          {/* Tab Content 1: Active Workspace */}
          <AnimatePresence mode="wait">
            {activeTab === 'workspace' && (
              <motion.div
                key="workspace-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Notes Organizer left screen */}
                <NoteHub notes={notes} onNotesChange={handleNotesChange} />

                {/* ToDo Matrix Panel right screen */}
                <TaskList tasks={tasks} onTasksChange={handleTasksChange} />
              </motion.div>
            )}

            {/* Tab Content 2: Diagnostics */}
            {activeTab === 'diagnostics' && (
              <motion.div
                key="diagnostics-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* Real storage sizes rendering */}
                <StorageInspector />

                {/* FAQ details explaining PWAs to customers */}
                <div id="pwa-faq" className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl text-left">
                  <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
                    <Info className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-sans font-semibold text-lg text-slate-100">Часто Задаваемые Вопросы (FAQ)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* FAQ 1 */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        Что дает установка PWA на моем устройстве?
                      </h4>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        После установки вы получаете полноэкранное приложение без адресной строки браузера. 
                        Оно выглядит и ощущается как стандартная программа на ПК или нативное мобильное приложение. 
                        Оно запускается мгновенно, работает офлайн и потребляет значительно меньше трафика и внутренней памяти.
                      </p>
                    </div>

                    {/* FAQ 2 */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        Как работает автономность без интернета?
                      </h4>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        Инструмент использует встроенный <strong className="text-indigo-300">Service Worker</strong> (фоновый скрипт), который 
                        кэширует важные HTML, JS, CSS файлы и изображения. Все добавляемые задачи и заметки 
                        моментально синхронизируются внутри приватного <strong className="text-indigo-300">LocalStorage</strong> прямо в браузере.
                      </p>
                    </div>

                    {/* FAQ 3 */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        В каких браузерах работает функция установки?
                      </h4>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        Функция полностью поддерживается на базе движков Chromium (Google Chrome, Microsoft Edge, Opera, Яндекс.Браузер) и на устройствах Apple через Safari. 
                        В Firefox и некоторых других браузерах PWA работает великолепно, но интерфейс установки активируется через 자체 меню браузера.
                      </p>
                    </div>

                    {/* FAQ 4 */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        Безопасно ли хранить данные PWA локально?
                      </h4>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        Абсолютно. Все ваши данные находятся внутри изолированного песочного хранилища вашего браузера на вашем устройстве. 
                        Они никогда не отправляются на сторонние сервера без вашего ведома. Прямой доступ к данным имеете только вы.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Humbler Clean Professional Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-900 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-slate-600" />
            <span className="text-xs text-slate-500 font-mono">PWA Studio © 2026 • Изолированное Локальное Хранилище</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Воркер Готов
            </span>
            <span className="text-slate-600">|</span>
            <span>Версия сборки: v1.0.4 (PWA standard)</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
