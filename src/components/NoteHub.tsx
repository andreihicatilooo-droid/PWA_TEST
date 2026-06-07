import React, { useState } from 'react';
import { PwaNote } from '../types';
import { Plus, Edit3, Trash2, FileText, Check, Search, Calendar, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NoteHubProps {
  notes: PwaNote[];
  onNotesChange: (updatedNotes: PwaNote[]) => void;
}

const NOTE_COLORS = [
  { name: 'Индиго', value: 'border-l-indigo-500 bg-indigo-500/5', colorHex: '#6366f1' },
  { name: 'Бирюзовый', value: 'border-l-cyan-500 bg-cyan-500/5', colorHex: '#06b6d4' },
  { name: 'Изумрудный', value: 'border-l-emerald-500 bg-emerald-500/5', colorHex: '#10b981' },
  { name: 'Оранжевый', value: 'border-l-amber-500 bg-amber-500/5', colorHex: '#f59e0b' },
  { name: 'Коралловый', value: 'border-l-rose-500 bg-rose-500/5', colorHex: '#f43f5e' }
];

export default function NoteHub({ notes, onNotesChange }: NoteHubProps) {
  const [search, setSearch] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [colorClass, setColorClass] = useState(NOTE_COLORS[0].value);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateNote = () => {
    const newNote: PwaNote = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      title: 'Новая заметка',
      content: '',
      tag: 'Черновик',
      color: NOTE_COLORS[0].value,
      updatedAt: Date.now()
    };

    const updated = [newNote, ...notes];
    onNotesChange(updated);
    setActiveNoteId(newNote.id);
    setTitle('Новая заметка');
    setContent('');
    setColorClass(NOTE_COLORS[0].value);
    setIsEditing(true);
  };

  const handleSelectNote = (note: PwaNote) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColorClass(note.color);
    setIsEditing(true);
  };

  const handleSaveActiveNote = () => {
    if (!activeNoteId) return;

    const updated = notes.map((note) => {
      if (note.id === activeNoteId) {
        return {
          ...note,
          title: title.trim() || 'Без названия',
          content,
          color: colorClass,
          updatedAt: Date.now()
        };
      }
      return note;
    });

    onNotesChange(updated);
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    onNotesChange(updated);
    if (activeNoteId === id) {
      setActiveNoteId(null);
      setIsEditing(false);
    }
  };

  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const characterCount = content ? content.length : 0;

  return (
    <div id="pwa-notes-workspace" className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-800">
        <div>
          <h2 className="font-sans font-semibold text-slate-100 tracking-tight text-lg flex items-center gap-2">
            <Feather className="w-5 h-5 text-indigo-400" />
            Блокнот Быстрых Заметок
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Все заметки работают оффлайн и сохраняются на лету.</p>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Создать
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Notes list: 5 columns */}
        <div className="md:col-span-5 space-y-3 flex flex-col">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по заметкам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* List scroll block */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => {
                  const isActive = note.id === activeNoteId;
                  const preview = note.content 
                    ? note.content.slice(0, 55) + (note.content.length > 55 ? '...' : '') 
                    : '(Пустая заметка)';
                  const dateStr = new Date(note.updatedAt).toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleSelectNote(note)}
                      className={`p-3.5 rounded-xl border-l-4 border-y border-r border-slate-800 cursor-pointer text-left transition-all ${
                        isActive 
                          ? 'bg-slate-950/60 border-slate-700/80 ring-1 ring-indigo-500/10' 
                          : 'bg-slate-950/20 hover:bg-slate-950/40'
                      } ${note.color}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate flex-1 leading-snug">
                          {note.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2 leading-relaxed">
                        {preview}
                      </p>
                      
                      <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t border-slate-900/40">
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 hover:bg-slate-900 rounded text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-600 text-xs">
                  Заметок не найдено
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Editor: 7 columns */}
        <div className="md:col-span-7 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between min-h-[300px]">
          {isEditing && activeNoteId ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3.5 flex-1 flex flex-col">
                {/* Note Title Input */}
                <input
                  type="text"
                  placeholder="Заголовок..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-b border-slate-800/80 focus:border-indigo-500/40 text-sm font-semibold text-slate-100 placeholder:text-slate-600 outline-none pb-2 w-full transition-all"
                />

                {/* Color Selection row */}
                <div className="flex flex-wrap items-center gap-1.5 py-1">
                  <span className="text-[10px] font-mono text-slate-500 mr-1 block">Метка:</span>
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColorClass(c.value)}
                      className={`w-4 h-4 rounded-full transition-transform cursor-pointer flex items-center justify-center border border-slate-900 ${
                        colorClass === c.value ? 'scale-125 border-slate-300' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      title={c.name}
                    >
                      {colorClass === c.value && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>

                {/* Content Editor */}
                <textarea
                  placeholder="Напишите что-нибудь важное..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-300 placeholder:text-slate-700 outline-none resize-none leading-relaxed flex-1 min-h-[150px]"
                />
              </div>

              {/* Status and Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-900/60 flex-wrap gap-2">
                <span className="text-[10px] font-mono text-slate-500">
                  {wordCount} слов • {characterCount} символов
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveActiveNote}
                    className="px-3.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <FileText className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-xs font-semibold text-slate-400">Редактор заметок</p>
              <p className="text-[11px] text-slate-500 max-w-[200px] mt-1">
                Выберите заметку из списка слева для просмотра или создайте совершенно новую в 1 клик.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
