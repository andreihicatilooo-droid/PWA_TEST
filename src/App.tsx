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
    <div className="min-h-screen bg-dark-surface text-[#F0F2F5] font-sans selection:bg-green-neon/30 selection:text-green-neon">
      
      {/* Background decoration in style of the theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-neon/5 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* Floating System Connection Status Toast */}
      <AnimatePresence>
        {notifMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3.5 bg-zinc-card border-2 border-zinc-800 shadow-[8px_8px_0px_#000000] flex items-center gap-3 w-[90%] max-w-sm sm:max-w-md rounded-none"
            id="pwa-toast-alert"
          >
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${isOnline ? 'bg-green-neon' : 'bg-rose-500'}`}></div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 text-left">{notifMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col min-h-screen justify-between">
        
        {/* Main Header Row in Bold Typography Style */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 mb-8 border-b-2 border-zinc-900">
          <div className="flex items-center gap-3.5">
            {/* Pulsing neon bulb indicator */}
            <div className="w-4.5 h-4.5 bg-green-neon rounded-full shrink-0 animate-pulse shadow-[0_0_12px_#00FF66]"></div>
            
            <div className="text-left">
              <h1 className="font-display font-black text-3xl tracking-tighter text-white uppercase italic">
                PWA STUDIO
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold mt-1">
                STANDALONE DEVICE ENVIRONMENT
              </p>
            </div>
          </div>

          {/* Quick Network Status & Tabs toggling */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            {/* Network Indicator Bubble */}
            <div className={`px-4 py-2 border text-[10px] font-mono font-bold tracking-widest uppercase transition-all ${
              isOnline 
                ? 'bg-green-neon/5 border-green-neon/30 text-green-neon' 
                : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
            }`}>
              {isOnline ? (
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>ONLINE READY</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>OFFLINE ARCHIVE</span>
                </span>
              )}
            </div>

            {/* Dashboard Workspace Toggle Controls in Brutalist Style */}
            <div className="bg-zinc-card p-1 border-2 border-zinc-900 flex items-center">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-none cursor-pointer font-black ${
                  activeTab === 'workspace' 
                    ? 'bg-white text-black' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                WORKSPACE
              </button>
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-none cursor-pointer font-black ${
                  activeTab === 'diagnostics' 
                    ? 'bg-white text-black' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                DIAGNOSTICS
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic workspace main layout views */}
        <main className="flex-1 space-y-8">
          
          {/* Aesthetic Hero Banner Watermark Container */}
          <div className="relative overflow-hidden bg-zinc-card p-8 border border-zinc-800 rounded-none text-left">
            <div className="absolute -top-4 -right-4 text-[100px] leading-none font-black tracking-tighter text-zinc-900/40 font-display select-none pointer-events-none uppercase italic">STUDIO</div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-green-neon font-bold block mb-2">Available for Chrome / Safari / Edge</span>
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white leading-none uppercase">BEYOND THE TAB.</h2>
            <p className="text-zinc-400 text-sm mt-3 leading-relaxed max-w-xl">Устанавливайте веб-приложения нового поколения одним кликом. Без посредников. С полной поддержкой оффлайн-режима и локальным хранилищем.</p>
          </div>

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
                transition={{ duration: 0.12 }}
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
                transition={{ duration: 0.12 }}
                className="space-y-6"
              >
                {/* Real storage sizes rendering */}
                <StorageInspector />

                {/* FAQ details explaining PWAs to customers */}
                <div id="pwa-faq" className="bg-zinc-card p-8 border border-zinc-800 text-left rounded-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-2 pb-4 mb-5 border-b border-zinc-800">
                    <Info className="w-5 h-5 text-green-neon" />
                    <h3 className="font-display font-extrabold text-xl text-white uppercase italic tracking-tight">Часто Задаваемые Вопросы (FAQ)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    {/* FAQ 1 */}
                    <div className="space-y-2">
                      <h4 className="font-black text-white hover:text-green-neon transition-colors flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-2 h-2 bg-green-neon"></span>
                        Установка на устройство
                      </h4>
                      <p className="text-zinc-400 leading-relaxed text-xs">
                        После установки вы получаете полноэкранное приложение без адресной строки браузера. 
                        Оно выглядит и ощущается как стандартная программа на ПК или нативное мобильное приложение. 
                        Оно запускается мгновенно, работает офлайн и потребляет значительно меньше трафика и внутренней памяти.
                      </p>
                    </div>

                    {/* FAQ 2 */}
                    <div className="space-y-2">
                      <h4 className="font-black text-white hover:text-green-neon transition-colors flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-2 h-2 bg-green-neon"></span>
                        Как работает оффлайн-режим?
                      </h4>
                      <p className="text-zinc-400 leading-relaxed text-xs">
                        Инструмент использует встроенный <strong className="text-green-neon font-medium">Service Worker</strong> (фоновый скрипт), который 
                        кэширует важные HTML, JS, CSS файлы и изображения. Все добавляемые задачи и заметки 
                        моментально синхронизируются внутри приватного <strong className="text-green-neon font-medium">LocalStorage</strong> прямо в браузере.
                      </p>
                    </div>

                    {/* FAQ 3 */}
                    <div className="space-y-2">
                      <h4 className="font-black text-white hover:text-green-neon transition-colors flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-2 h-2 bg-green-neon"></span>
                        Поддерживаемые браузеры
                      </h4>
                      <p className="text-zinc-400 leading-relaxed text-xs">
                        Функция полностью поддерживается на базе движков Chromium (Google Chrome, Microsoft Edge, Opera, Яндекс.Браузер) и на устройствах Apple через Safari. 
                        В Firefox и некоторых других браузерах PWA работает великолепно, но интерфейс установки активируется через 자체 меню браузера.
                      </p>
                    </div>

                    {/* FAQ 4 */}
                    <div className="space-y-2">
                      <h4 className="font-black text-white hover:text-green-neon transition-colors flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-2 h-2 bg-green-neon"></span>
                        Безопасность данных
                      </h4>
                      <p className="text-zinc-400 leading-relaxed text-xs">
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

        {/* Humbler Clean Professional Brutalist Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] uppercase font-black text-zinc-600 tracking-wider">ARCHITECTURE STATE</span>
            <span className="text-sm font-bold flex items-center gap-2 text-zinc-400">
              <Laptop className="w-4 h-4 text-green-neon" />
              Brotli Compressed &bull; Service Worker 2.1
            </span>
          </div>
          <div className="flex flex-col sm:items-end gap-1 font-mono text-[10px] text-zinc-600">
            <div className="text-right text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">
              Powered by Nebulax Core &copy; 2026
            </div>
            <span>v1.0.4 &bull; W3C Standard Compliance</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
