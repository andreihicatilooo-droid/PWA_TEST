import React, { useState, useEffect } from 'react';
import { PwaTask } from '../types';
import { Plus, Check, Trash2, Tag, Calendar, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskListProps {
  tasks: PwaTask[];
  onTasksChange: (updatedTasks: PwaTask[]) => void;
}

export default function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: PwaTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      description: newDesc.trim(),
      completed: false,
      priority: newPriority,
      createdAt: Date.now()
    };

    const updated = [newTask, ...tasks];
    onTasksChange(updated);
    
    // Reset forms
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setShowAddForm(false);
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onTasksChange(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    onTasksChange(updated);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div id="pwa-task-workspace" className="bg-zinc-card p-6 border border-zinc-800 shadow-[4px_4px_0px_#000000] overflow-hidden relative rounded-none text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-5 border-b border-zinc-800">
        <div>
          <h2 className="font-display font-black text-lg text-white uppercase italic tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-neon" />
            Список Оффлайн-Задач
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Автономное кэширование внутри песочницы</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-neon hover:bg-white text-black hover:text-black text-[10px] font-black uppercase tracking-widest transition-none cursor-pointer rounded-none border-none shadow-[2px_2px_0px_#ffffff] active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Скрыть панель' : 'Новая задача'}
        </button>
      </div>

      {/* Dynamic Progress Meter */}
      {tasks.length > 0 && (
        <div className="mb-6 bg-black p-4 border border-zinc-900 rounded-none">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            <span>ПРОГРЕСС СИНХРОНИЗАЦИИ:</span>
            <span className="font-black text-green-neon font-mono">{completedCount} ИЗ {tasks.length} [{progressPercent}%]</span>
          </div>
          <div className="w-full bg-zinc-905 border border-zinc-900 h-2.5 rounded-none overflow-hidden p-0.5">
            <div 
              className="bg-green-neon h-1 transition-all duration-300 shadow-[0_0_8px_#00FF66]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Slide-In Create Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleAddTask}
            className="mb-6 p-5 bg-black border-2 border-zinc-900 space-y-4 overflow-hidden rounded-none"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest mb-1.5">ЧТО НЕОБХОДИМО СДЕЛАТЬ?</label>
                <input
                  type="text"
                  placeholder="Название задачи..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-card border-2 border-zinc-900 focus:border-green-neon text-xs rounded-none px-3.5 py-2 text-white outline-none font-bold uppercase transition-all placeholder:text-zinc-650"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest mb-1.5">ПРИОРИТЕТ</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-zinc-card border-2 border-zinc-900 focus:border-green-neon text-xs rounded-none px-3 py-2 text-white outline-none font-bold uppercase cursor-pointer"
                >
                  <option value="low">Низкий (LOW)</option>
                  <option value="medium">Средний (MEDIUM)</option>
                  <option value="high">Высокий (HIGH)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest mb-1.5">ДОПОЛНИТЕЛЬНОЕ ОПИСАНИЕ (ОПЦИОНАЛЬНО)</label>
              <textarea
                placeholder="Детали выполнения или ссылки..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full bg-zinc-card border-2 border-zinc-900 focus:border-green-neon text-xs rounded-none px-3.5 py-2 text-white outline-none font-semibold transition-all resize-none placeholder:text-zinc-650"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 text-[10px] font-black uppercase tracking-widest transition-none cursor-pointer rounded-none border border-zinc-800"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4.5 py-2 bg-green-neon text-black hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest transition-none cursor-pointer rounded-none border-none shadow-[2px_2px_0px_#ffffff] active:translate-y-0.5"
              >
                Cоздать
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter / Controls row in brutalist tab box */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1.5 hidden sm:inline">ФИЛЬТР:</span>
        <div className="bg-black p-0.5 border border-zinc-900 flex items-center">
          {(['all', 'active', 'completed'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-none ${
                filter === k 
                  ? 'bg-green-neon text-black' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {k === 'all' && 'Все'}
              {k === 'active' && 'Активные'}
              {k === 'completed' && 'Выполненные'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List Content */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const dateStr = new Date(task.createdAt).toLocaleDateString('ru-RU', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className={`p-3.5 border text-left transition-none rounded-none ${
                    task.completed 
                      ? 'bg-black border-zinc-900 opacity-50' 
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-none border-2 flex items-center justify-center shrink-0 mt-0.5 transition-none cursor-pointer ${
                          task.completed 
                            ? 'bg-green-neon border-green-neon text-black' 
                            : 'border-zinc-700 hover:border-green-neon text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[4]" />
                      </button>

                      {/* Title & Desc */}
                      <div className="min-w-0">
                        <span className={`text-xs font-black block truncate leading-snug uppercase tracking-wide ${
                          task.completed ? 'line-through text-zinc-500' : 'text-white'
                        }`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className={`text-xs mt-1.5 leading-normal ${
                            task.completed ? 'text-zinc-650' : 'text-zinc-400'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        
                        {/* Meta Tags */}
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                          <span className="text-[9px] text-zinc-500 font-mono font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                            {dateStr}
                          </span>
                          
                          {/* Priority tag */}
                          <span className={`text-[8px] font-mono font-extrabold uppercase py-0.5 px-1.5 rounded-none flex items-center gap-1 ${
                            task.priority === 'high' 
                              ? 'bg-rose-500 text-white font-black' 
                              : task.priority === 'medium'
                              ? 'bg-amber-400 text-black font-black' 
                              : 'bg-zinc-800 text-zinc-300 font-black'
                          }`}>
                            <AlertCircle className="w-2.5 h-2.5" />
                            {task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MEDIUM' : 'LOW'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Trigger */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-zinc-500 hover:text-rose-400 p-2 hover:bg-black/80 border border-transparent hover:border-rose-400/20 rounded-none transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 bg-black border border-zinc-800/40 text-center text-zinc-500 text-xs space-y-1.5 rounded-none">
              <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto" />
              <p className="font-extrabold uppercase tracking-widest text-zinc-400">Нет подходящих задач</p>
              <p className="text-[11px] text-zinc-500">Добавьте задачу через панель управления выше.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
