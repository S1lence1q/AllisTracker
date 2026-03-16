import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Plus, X, HandMetal, Hash, Trash2, Edit2, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

// Custom hook til LocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const App = () => {
  // State
  const [bollebank, setBollebank] = useLocalStorage('allis-bollebank', 0);
  const [quotes, setQuotes] = useLocalStorage('allis-quotes', [
    { id: 1, text: "Man skal bare tænke som en fisk, så går det hele.", date: new Date().toLocaleDateString() }
  ]);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [isQuotesExpanded, setIsQuotesExpanded] = useState(false);
  const inputRef = useRef(null);

  // Auto-fokus på input når modal åbner
  useEffect(() => {
    if (isAddingQuote && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isAddingQuote]);

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleSlag = () => {
    triggerHaptic();
    setBollebank(prev => prev + 1);
  };

  const saveQuote = (e) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;

    if (editingQuoteId) {
      setQuotes(quotes.map(q =>
        q.id === editingQuoteId ? { ...q, text: newQuoteText } : q
      ));
    } else {
      setQuotes([{
        id: Date.now(),
        text: newQuoteText,
        date: new Date().toLocaleDateString()
      }, ...quotes]);
    }

    setNewQuoteText("");
    setIsAddingQuote(false);
    setEditingQuoteId(null);
  };

  const deleteQuote = (id) => {
    if (window.confirm("Sikker på du vil slette dette citat?")) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingQuoteId(null);
    setNewQuoteText("");
    setIsAddingQuote(true);
  };

  const openEditModal = (quote) => {
    setEditingQuoteId(quote.id);
    setNewQuoteText(quote.text);
    setIsAddingQuote(true);
  };

  return (
    <div className="h-full flex flex-col items-center pt-12 pb-6 px-6 relative overflow-hidden">

      {/* HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full text-center mb-8"
      >
        <span className="text-primary/80 font-semibold tracking-widest text-xs uppercase letter-spacing-2">Allis Tracker</span>
      </motion.div>

      {/* BØLLEBANK COUNTER (TOP) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mb-8 relative z-10">
        <motion.div
          key={bollebank}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[140px] md:text-[180px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20 drop-shadow-[0_10px_40px_rgba(255,255,255,0.15)] mb-4 tracking-tighter"
        >
          {bollebank}
        </motion.div>
        <div className="text-white/30 tracking-[0.2em] text-xs font-bold mb-14 flex items-center gap-1.5">
          <Hash size={12} /> POTENTIELLE BØLLEBANK
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: Math.random() * 10 - 5 }}
          onClick={handleSlag}
          className="relative group w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center outline-none"
        >
          {/* Bold, flat styling uden generic gradients */}
          <div className="absolute inset-0 rounded-full bg-primary opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl"></div>

          <div className="absolute inset-0 rounded-full bg-primary z-20 flex flex-col items-center justify-center border border-white/10 shadow-lg">
            <HandMetal className="text-white mb-2" size={48} strokeWidth={2} />
            <span className="font-bold text-xl tracking-wider text-white uppercase mt-1">Slå mig!</span>
          </div>
        </motion.button>
      </div>

      {/* QUOTES SEKTION (BUND) */}
      <motion.div
        animate={{ height: isQuotesExpanded ? '40%' : '14%' }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full absolute bottom-0 left-0 bg-[#060608]/90 border-t border-white/10 rounded-t-[40px] pt-6 pb-8 px-6 flex flex-col z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="flex justify-between items-center mb-4 px-2 cursor-pointer" onClick={() => setIsQuotesExpanded(!isQuotesExpanded)}>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Quote size={20} className="text-white/40" /> Citater
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isQuotesExpanded) setIsQuotesExpanded(true);
                openAddModal();
              }}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/70 active:scale-95 transition-all duration-300"
            >
              <Plus size={20} />
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              {isQuotesExpanded ? <ChevronDown size={28} /> : <ChevronUp size={28} />}
            </button>
          </div>
        </div>

        {/* Swipebar Karrusel */}
        <AnimatePresence>
          {isQuotesExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory hide-scrollbar flex-1 items-stretch"
            >
              {quotes.map((quote) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="snap-center shrink-0 w-[82%] max-w-[320px] h-full bg-[#121214] hover:bg-[#1a1a1c] transition-colors border border-white/10 rounded-[32px] p-7 flex flex-col justify-center relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  <Quote size={40} className="absolute top-5 left-5 text-white/[0.03]" />
                  <p className="text-[1.35rem] leading-[1.4] font-medium mb-5 relative z-10 text-white/90 font-light tracking-wide mt-4 pr-14">
                    "{quote.text}"
                  </p>

                  <div className="absolute top-4 right-4 flex gap-1 bg-[#0a0a0c] border border-white/10 rounded-xl p-1 z-20 shadow-lg">
                    <button onClick={() => openEditModal(quote)} className="text-white/40 hover:text-white transition-colors p-2 active:scale-90">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteQuote(quote.id)} className="text-white/40 hover:text-red-500 transition-colors p-2 active:scale-90">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="text-[10px] text-white/40 mt-auto uppercase tracking-widest font-semibold flex items-center justify-between">
                    <span>Allis</span> <span>{quote.date}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* TILFØJ CITAT MODAL */}
      <AnimatePresence>
        {isAddingQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-[32px] p-7 relative shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            >
              <button
                onClick={() => {
                  setIsAddingQuote(false);
                  setEditingQuoteId(null);
                }}
                className="absolute top-4 right-4 text-white/50 bg-white/5 rounded-full p-2"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold tracking-wide mb-6 text-white">
                {editingQuoteId ? "Ret Citat" : "Nyt Citat"}
              </h3>

              <form onSubmit={saveQuote}>
                <textarea
                  ref={inputRef}
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="Hvad sagde hun nu?..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-white placeholder-white/30 outline-none focus:border-primary focus:bg-white/[0.06] transition-all duration-300 resize-none h-32 mb-6 font-medium tracking-wide"
                />

                <button
                  type="submit"
                  disabled={!newQuoteText.trim()}
                  className="w-full py-4 rounded-2xl bg-primary hover:bg-accent text-white font-bold tracking-widest text-lg uppercase shadow-none disabled:opacity-40 disabled:scale-100 transition-colors duration-300"
                >
                  {editingQuoteId ? "Gem Ændring" : "Gem Citat"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
