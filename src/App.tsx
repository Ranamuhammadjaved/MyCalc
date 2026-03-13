/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { create, all } from 'mathjs';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Trash2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Delete, 
  Equal,
  RotateCcw,
  Info,
  BrainCircuit
} from 'lucide-react';
import { cn } from './lib/utils';
import { solveWithAI } from './services/aiService';

const math = create(all);

type HistoryItem = {
  expression: string;
  result: string;
  timestamp: number;
  isAI?: boolean;
  explanation?: string;
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' || prev === 'Error' ? num : prev + num));
    setError(null);
  };

  const handleOperator = (op: string) => {
    setDisplay(prev => (prev === 'Error' ? op : prev + op));
    setError(null);
  };

  const handleClear = () => {
    setDisplay('0');
    setError(null);
  };

  const handleDelete = () => {
    setDisplay(prev => {
      if (prev.length === 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalculate = () => {
    try {
      const result = math.evaluate(display);
      const formattedResult = Number.isFinite(result) ? math.format(result, { precision: 14 }) : 'Error';
      
      setHistory(prev => [
        ...prev,
        { expression: display, result: formattedResult, timestamp: Date.now() }
      ]);
      setDisplay(formattedResult);
    } catch (err) {
      setDisplay('Error');
      setError('Invalid Expression');
    }
  };

  const handleAISolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsSolving(true);
    setError(null);
    try {
      const data = await solveWithAI(aiPrompt);
      setHistory(prev => [
        ...prev,
        { 
          expression: aiPrompt, 
          result: data.result, 
          timestamp: Date.now(), 
          isAI: true,
          explanation: data.explanation
        }
      ]);
      setDisplay(data.result);
      setAiPrompt('');
    } catch (err) {
      setError('AI failed to solve. Try again.');
    } finally {
      setIsSolving(false);
    }
  };

  const buttons = [
    { label: 'C', action: handleClear, className: 'text-red-500 hover:bg-red-500/10' },
    { label: '(', action: () => handleOperator('('), className: 'text-emerald-500' },
    { label: ')', action: () => handleOperator(')'), className: 'text-emerald-500' },
    { label: '/', action: () => handleOperator('/'), className: 'text-emerald-500', icon: <ChevronRight className="w-4 h-4 rotate-[-45deg]" /> },
    
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: '*', action: () => handleOperator('*'), className: 'text-emerald-500' },
    
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '-', action: () => handleOperator('-'), className: 'text-emerald-500' },
    
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '+', action: () => handleOperator('+'), className: 'text-emerald-500' },
    
    { label: '0', action: () => handleNumber('0'), className: 'col-span-1' },
    { label: '.', action: () => handleNumber('.') },
    { label: 'DEL', action: handleDelete, className: 'text-orange-500 hover:bg-orange-500/10' },
    { label: '=', action: handleCalculate, className: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' },
  ];

  const scientificButtons = [
    { label: 'sin', action: () => handleOperator('sin(') },
    { label: 'cos', action: () => handleOperator('cos(') },
    { label: 'tan', action: () => handleOperator('tan(') },
    { label: 'log', action: () => handleOperator('log(') },
    { label: 'ln', action: () => handleOperator('ln(') },
    { label: 'sqrt', action: () => handleOperator('sqrt(') },
    { label: 'π', action: () => handleNumber('PI') },
    { label: 'e', action: () => handleNumber('e') },
    { label: '^', action: () => handleOperator('^') },
    { label: '!', action: () => handleOperator('!') },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-emerald-500/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        
        {/* Main Calculator Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151518] rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-bottom border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-emerald-500" />
              </div>
              <h1 className="font-semibold tracking-tight">AI Calculator</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsScientific(!isScientific)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isScientific ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                )}
              >
                Scientific
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  "p-2 rounded-full transition-all lg:hidden",
                  showHistory ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-zinc-400"
                )}
              >
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Display */}
          <div className="px-8 py-10 flex flex-col items-end justify-end min-h-[160px] bg-black/20">
            <AnimatePresence mode="wait">
              <motion.div 
                key={display}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-light tracking-tighter break-all text-right"
              >
                {display}
              </motion.div>
            </AnimatePresence>
            {error && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs mt-2 font-medium uppercase tracking-widest"
              >
                {error}
              </motion.span>
            )}
          </div>

          {/* AI Input */}
          <form onSubmit={handleAISolve} className="px-6 py-4 bg-white/5 border-y border-white/5">
            <div className="relative group">
              <input 
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI to solve (e.g. 'area of circle r=5')"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
              />
              <Sparkles className="w-4 h-4 text-emerald-500/50 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
              <button 
                type="submit"
                disabled={isSolving || !aiPrompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-500 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
              >
                {isSolving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Keypad */}
          <div className="p-6 grid grid-cols-4 gap-3">
            {isScientific && (
              <div className="col-span-4 grid grid-cols-5 gap-2 mb-2">
                {scientificButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.action}
                    className="py-2.5 rounded-xl bg-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 hover:text-zinc-100 transition-all active:scale-95"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
            {buttons.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={cn(
                  "h-14 rounded-2xl flex items-center justify-center text-lg font-medium transition-all active:scale-95",
                  btn.className || "bg-white/5 hover:bg-white/10 text-zinc-200"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* History Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "bg-[#151518] rounded-3xl border border-white/5 flex flex-col overflow-hidden transition-all",
            showHistory ? "fixed inset-4 z-50 lg:relative lg:inset-0" : "hidden lg:flex"
          )}
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">History</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setHistory([])}
                className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 lg:hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
          >
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 opacity-20" />
                </div>
                <p className="text-xs font-medium uppercase tracking-tighter">No calculations yet</p>
              </div>
            ) : (
              history.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.timestamp}
                  className="group relative bg-black/20 rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.isAI && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[8px] font-bold text-emerald-500 uppercase">AI</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400 mb-1 break-all font-mono">
                    {item.expression}
                  </div>
                  <div className="text-xl font-semibold text-zinc-100 break-all">
                    = {item.result}
                  </div>
                  {item.explanation && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-500 leading-relaxed italic">
                      {item.explanation}
                    </div>
                  )}
                  <button 
                    onClick={() => setDisplay(item.result)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500/20 hover:text-emerald-500"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
