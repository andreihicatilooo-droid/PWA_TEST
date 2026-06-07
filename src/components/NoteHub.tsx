import React, { useState } from 'react';
import { PwaNote } from '../types';
import { Plus, Edit3, Trash2, FileText, Check, Search, Calendar, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NoteHubProps {
  notes: PwaNote[];
  onNotesChange: (updatedNotes: PwaNote[]) => void;
}

const NOTE_COLORS = [
  { name: 'Неон', value: 'border-l-green-neon bg-green-neon/5', colorHex: '#00FF66' },
  { name: 'Бирюзовый', value: 'border-l-cyan-400 bg-cyan-400/5', colorHex: '#22D3EE' },
  { name: 'Розовый', value: 'border-l-rose-500 bg-rose-500/5', colorHex: '#F43F5E' },
  { name: 'Золотой', value: 'border-l-amber-400 bg-amber-400/5', colorHex: '#FBBF24' },
  { name: 'Пурпурный', value: 'border-l-fuchsia-500 bg-fuchsia-500/5', colorHex: '#D946EF' }
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
    <div id="pwa-notes-workspace" className="bg-zinc-card p-6 border border-zinc-800 shadow-[4px_4px_0px_#000000] overflow-hidden relative rounded-none text-left">
      
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center pb-4 mb-5 border-b border-zinc-800 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-lg text-white uppercase italic tracking-tight flex items-center gap-2">
            <Feather className="w-5 h-5 text-green-neon" />
            Блокнот Быстрых Заметок
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Офлайн автосохранение локального стека</p>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-neon hover:bg-white text-black hover:text-black text-[10px] font-black uppercase tracking-widest transition-none cursor-pointer rounded-none border-none shadow-[2px_2px_0px_#ffffff] active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Создать
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Notes list: 5 columns */}
        <div className="md:col-span-12 lg:col-span-5 space-y-3 flex flex-col">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="ПОИСК ЗАМЕТОК..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border-2 border-zinc-900 rounded-none pl-10 pr-3 py-2.5 text-xs text-white uppercase tracking-wider font-bold outline-none focus:border-green-neon transition-all placeholder:text-zinc-500"
            />
          </div>

          {/* List scroll block */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
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
                      className={`p-3.5 border-l-4 border-y border-r border-zinc-800 cursor-pointer text-left rounded-none transition-none ${
                        isActive 
                          ? 'bg-black border-zinc-700' 
                          : 'bg-zinc-900/40 hover:bg-zinc-900/70 border-zinc-900'
                      } ${note.color}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-black text-white hover:text-green-neon transition-colors truncate flex-1 leading-snug">
                          {note.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-wider shrink-0 uppercase">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1.5 lines-clamp-2 leading-relaxed">
                        {preview}
                      </p>
                      
                      <div className="flex justify-end gap-1.5 mt-2.5 pt-2 border-t border-zinc-800/50">
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1.5 bg-black hover:bg-rose-950/30 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 bg-black border border-zinc-800/50 text-center text-zinc-500 text-[10px] uppercase tracking-wider font-bold">
                  Заметок не найдено
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Editor: 7 columns (or 12 on small layouts) */}
        <div className="md:col-span-12 lg:col-span-7 bg-black p-5 border-2 border-zinc-900 flex flex-col justify-between min-h-[300px] rounded-none">
          {isEditing && activeNoteId ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Note Title Input */}
                <input
                  type="text"
                  placeholder="ЗАГОЛОВОК..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-b-2 border-zinc-900 focus:border-green-neon text-sm font-black text-white uppercase tracking-wider placeholder:text-zinc-600 outline-none pb-2 w-full transition-all"
                />

                {/* Color Selection row */}
                <div className="flex flex-wrap items-center gap-2 py-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black mr-1 block">Метка:</span>
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColorClass(c.value)}
                      className={`w-5 h-5 rounded-none transition-transform cursor-pointer flex items-center justify-center border-2 ${
                        colorClass === c.value ? 'scale-110 border-white' : 'border-black hover:border-zinc-700'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                      title={c.name}
                    >
                      {colorClass === c.value && <Check className="w-3.5 h-3.5 text-black stroke-[4]" />}
                    </button>
                  ))}
                </div>

                {/* Content Editor */}
                <textarea
                  placeholder="Напишите важное примечание или код..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 outline-none resize-none leading-relaxed flex-1 min-h-[150px] font-mono"
                />
              </div>

              {/* Status and Action Buttons */}
              <div className="flex justify-between items-center pt-3.5 border-t border-zinc-900 flex-wrap gap-2 text-left">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  {wordCount} ВЫРАЖЕНИЙ • {characterCount} БАЙТ
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 text-[9px] font-black uppercase tracking-widest transition-none cursor-pointer rounded-none border border-zinc-800"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveActiveNote}
                    className="px-4 py-2 bg-green-neon hover:bg-white text-black hover:text-black text-[9px] font-black uppercase tracking-widest transition-none flex items-center gap-1.5 cursor-pointer rounded-none border-none shadow-[2px_2px_0px_#ffffff] active:translate-y-0.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-600">
              <FileText className="w-10 h-10 text-zinc-800 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Редактор заметок</p>
              <p className="text-[11px] text-zinc-500 max-w-[200px] mt-1.5 leading-relaxed font-semibold">
                Выберите заметку из списка слева для просмотра или создайте совершенно новую в один клик.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
