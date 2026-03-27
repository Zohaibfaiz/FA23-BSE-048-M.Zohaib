'use client';
// components/layout/LearningWidget.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle2, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import type { LearningQuestion } from '@/types';

interface Props { questions: LearningQuestion[]; }

export default function LearningWidget({ questions }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];
  const isCorrect = selected === q?.correct_key;

  function handleSelect(value: string) {
    if (selected) return;
    setSelected(value);
    if (value === q.correct_key) setScore(s => s + 1);
  }

  function handleNext() {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  function handleReset() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  if (!q) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 glow-border-purple"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <GraduationCap size={20} className="text-violet-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Quick Knowledge Check</h3>
              <p className="text-xs text-white/40">
                {current + 1} / {questions.length} questions
              </p>
            </div>
            <div className="ml-auto text-sm font-bold text-violet-400">
              Score: {score}/{questions.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                {/* Question */}
                <p className="text-base font-semibold text-white mb-5">{q.question}</p>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {q.options.map((opt) => {
                    const isSelected = selected === opt.value;
                    const isCorrectOpt = opt.value === q.correct_key;
                    let bgStyle = 'border-white/10 hover:border-white/20 bg-white/3';
                    if (selected) {
                      if (isCorrectOpt) bgStyle = 'border-green-500/50 bg-green-500/10';
                      else if (isSelected) bgStyle = 'border-red-500/50 bg-red-500/10';
                      else bgStyle = 'border-white/5 opacity-50';
                    }

                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all ${bgStyle}`}
                      >
                        <span className={selected && isCorrectOpt ? 'text-green-400' : selected && isSelected ? 'text-red-400' : 'text-white/80'}>
                          {opt.label}
                        </span>
                        {selected && isCorrectOpt && <CheckCircle2 size={16} className="text-green-400" />}
                        {selected && isSelected && !isCorrectOpt && <XCircle size={16} className="text-red-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {selected && q.explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-3 rounded-xl text-sm mb-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'}`}
                    >
                      💡 {q.explanation}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selected && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleNext}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {current + 1 < questions.length ? 'Next Question' : 'Finish'}
                    <ChevronRight size={16} />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="text-5xl mb-4">{score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '📚'}</div>
                <h4 className="text-2xl font-display font-bold text-white mb-2">
                  {score}/{questions.length} Correct!
                </h4>
                <p className="text-white/50 mb-6">
                  {score === questions.length ? 'Perfect score! You know AdFlow Pro well.' : 'Keep exploring to learn more about our platform.'}
                </p>
                <button onClick={handleReset} className="btn-ghost flex items-center gap-2 mx-auto">
                  <RefreshCw size={16} /> Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
