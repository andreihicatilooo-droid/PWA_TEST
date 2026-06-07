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
    <div id="pwa-task-workspace" className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-5 border-b border-slate-800">
        <div>
          <h2 className="font-sans font-semibold text-slate-100 tracking-tight text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Список Оффлайн-Задач
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Данные сохраняются автоматически прямо на вашем устройстве.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Скрыть панель' : 'Новая задача'}
        </button>
      </div>

      {/* Dynamic Progress Meter */}
      {tasks.length > 0 && (
        <div className="mb-6 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
            <span>Прогресс выполнения задач:</span>
            <span className="font-semibold text-indigo-300 font-mono">{completedCount} из {tasks.length} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
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
            transition={{ duration: 0.2 }}
            onSubmit={handleAddTask}
            className="mb-5 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3.5 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">Что необходимо сделать?</label>
                <input
                  type="text"
                  placeholder="Название задачи..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">Приоритет</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all cursor-pointer"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">Дополнительное описание (опционально)</label>
              <textarea
                placeholder="Детали, шаги или ссылки..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all resize-none placeholder:text-slate-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Cоздать
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter / Controls row */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span className="text-xs text-slate-500 mr-1.5 hidden sm:inline">Фильтр:</span>
        {(['all', 'active', 'completed'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
              filter === k 
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {k === 'all' && 'Все'}
            {k === 'active' && 'В процессе'}
            {k === 'completed' && 'Выполнено'}
          </button>
        ))}
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
                  transition={{ duration: 0.15 }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    task.completed 
                      ? 'bg-slate-950/20 border-slate-900 opacity-60' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                          task.completed 
                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                            : 'border-slate-700 hover:border-slate-500 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      {/* Title & Desc */}
                      <div className="min-w-0">
                        <span className={`text-sm font-semibold block truncate leading-snug ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className={`text-xs mt-1 leading-normal ${
                            task.completed ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        
                        {/* Meta Tags */}
                        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {dateStr}
                          </span>
                          
                          {/* Priority tag */}
                          <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-1.5 rounded flex items-center gap-1 ${
                            task.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            <AlertCircle className="w-2.5 h-2.5" />
                            {task.priority === 'high' ? 'Важно' : task.priority === 'medium' ? 'Средне' : 'Низко'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Trigger */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-600 hover:text-rose-400 p-1.5 hover:bg-slate-900 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm space-y-1">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-400">Нет подходящих задач</p>
              <p className="text-xs text-slate-500">Добавьте задачу через панель управления выше.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
