import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import type { CityAnswer, CityAssistantContext } from '../../services/ai/ai';

interface AskAssistantProps {
  cityName: string;
  context: CityAssistantContext;
  ask: (question: string) => Promise<CityAnswer>;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  question?: string;
  answer?: CityAnswer;
  error?: string;
}

let messageId = 1;

const label = 'text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]';

/**
 * Interactive "Ask CityPulse AI" assistant.
 * - 4 data-derived suggested-question chips
 * - animated thinking indicator
 * - structured, expandable response cards (summary / key findings / recommendations)
 * - visible Q&A history for natural follow-ups (no ChatGPT-style session)
 */
export const AskAssistant = ({ cityName, context, ask }: AskAssistantProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const seqRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const submit = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q || thinking) return;
      const mySeq = ++seqRef.current;
      setMessages((prev) => [...prev, { id: messageId++, role: 'user', question: q }]);
      setThinking(true);
      setInput('');
      try {
        const answer = await ask(q);
        if (mySeq !== seqRef.current) return; // stale response
        setMessages((prev) => [...prev, { id: messageId++, role: 'assistant', answer }]);
      } catch (err) {
        if (mySeq !== seqRef.current) return;
        const message =
          err instanceof Error && err.message ? err.message : 'I could not generate an answer right now.';
        setMessages((prev) => [...prev, { id: messageId++, role: 'assistant', error: message }]);
      } finally {
        if (mySeq === seqRef.current) setThinking(false);
      }
    },
    [ask, thinking]
  );

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Suggested questions derived from the city's real data (never answers).
  const chips = [
    'What is the biggest problem in ' + cityName + '?',
    context.stats.healthScore !== null
      ? 'Why is the health score ' + context.stats.healthScore + '?'
      : 'Is there enough data for ' + cityName + '?',
    'Summarize the civic issues in ' + cityName,
    'What needs immediate attention?',
  ];

  const chipClass =
    'rounded-xl border border-white/50 bg-white/50 backdrop-blur px-3 py-2.5 text-xs text-left hover:bg-white/70 hover:border-[var(--accent)/40] transition-colors disabled:opacity-40' +
    ' ' +
    'text-[var(--text-secondary)]';

  return (
    <GlassCard className="p-6">
      <h3 className="font-display text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Ask CityPulse AI</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Answers are grounded in {cityName}&apos;s reported issue data.
      </p>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(input)}
          placeholder={'Ask anything about ' + cityName + '...'}
          disabled={thinking}
          className="flex-1 px-4 py-3 text-sm border border-white/50 bg-white/50 backdrop-blur rounded-xl focus:outline-none focus:border-[var(--black)]"
          style={{ color: 'var(--text-primary)' }}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => submit(input)}
          disabled={!input.trim() || thinking}
          className="px-5 py-3 rounded-xl bg-[var(--black)] text-white text-sm font-medium uppercase tracking-wide hover:bg-[#222] transition-colors disabled:opacity-40"
        >
          Ask
        </motion.button>
      </div>

      {/* Suggested chips */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {chips.map((chip, i) => (
          <motion.button
            key={chip}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 * i }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => submit(chip)}
            disabled={thinking}
            className={chipClass}
          >
            <span className="mr-1" style={{ color: 'var(--accent)' }}>?</span>
            {chip}
          </motion.button>
        ))}
      </div>

      <hr className="rule-dotted my-5" />

      {/* Q&A history */}
      <div ref={listRef} className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {m.role === 'user' ? (
                <div className="text-right">
                  <span className="inline-block max-w-[85%] px-4 py-2 rounded-2xl bg-[var(--black)] text-white text-sm text-left align-top">
                    {m.question}
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-white/50 bg-white/40 backdrop-blur p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: 'var(--accent)' }}>✦</span>
                    <span className={label}>CityPulse AI</span>
                  </div>
                  {m.error ? (
                    <p className="text-sm" style={{ color: 'var(--status-red)' }}>{m.error}</p>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {m.answer?.summary}
                      </p>

                      {(m.answer?.keyFindings?.length ?? 0) > 0 ||
                      (m.answer?.recommendations?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(m.id)}
                          className="mt-3 text-xs uppercase tracking-[0.08em] font-medium hover:opacity-80 transition-opacity"
                          style={{ color: 'var(--accent)' }}
                        >
                          {expandedIds.has(m.id) ? 'Hide analysis' : 'Show analysis'}
                        </button>
                      ) : null}

                      <AnimatePresence initial={false}>
                        {expandedIds.has(m.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            {m.answer?.keyFindings && m.answer.keyFindings.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/40">
                                <p className={label + ' mb-1'}>Key findings</p>
                                <ul className="space-y-1.5">
                                  {m.answer.keyFindings.map((k, i) => (
                                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      <span style={{ color: 'var(--accent)' }}>▸</span>
                                      <span>{k}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {m.answer?.recommendations && m.answer.recommendations.length > 0 && (
                              <div className="mt-3">
                                <p className={label + ' mb-1'}>Recommendations</p>
                                <ul className="space-y-1.5">
                                  {m.answer.recommendations.map((r, i) => (
                                    <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      <span style={{ color: 'var(--status-green)' }}>→</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-white/50 bg-white/30 backdrop-blur px-4 py-3 flex items-center gap-2"
            >
              <span className={label}>CityPulse AI is thinking</span>
              {[0, 1, 2].map((n) => (
                <motion.span
                  key={n}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--text-secondary)' }}
                  animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: n * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
