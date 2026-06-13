import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';

export const SearchFilters = ({ filters, onChange }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass p-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between font-display text-base font-semibold"
      >
        <span className="flex items-center gap-2">
          <Filter size={18} className="text-[var(--color-brass)]" /> Refine Search
        </span>
        <ChevronDown size={18} className={`text-[var(--color-brass)] transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-5 space-y-4 overflow-hidden"
          >
            <div>
              <label className="section-label mb-2 block">Disease / Specialty</label>
              <input
                className="input-field"
                placeholder="e.g. Heart Disease"
                value={filters.disease || ''}
                onChange={(e) => onChange({ ...filters, disease: e.target.value })}
              />
            </div>

            <div>
              <label className="section-label mb-2 block">City</label>
              <input
                className="input-field"
                placeholder="Karachi"
                value={filters.city || ''}
                onChange={(e) => onChange({ ...filters, city: e.target.value })}
              />
            </div>

            <div>
              <label className="section-label mb-2 block">Treatment Type</label>
              {['allopathic', 'homeopathic', 'herbal'].map((type) => (
                <label key={type} className="flex items-center gap-2 py-1.5 text-sm capitalize text-muted">
                  <input
                    type="checkbox"
                    checked={filters.type === type}
                    onChange={() =>
                      onChange({ ...filters, type: filters.type === type ? '' : type })
                    }
                    className="accent-[var(--color-brass)]"
                  />
                  {type}
                </label>
              ))}
            </div>

            <div>
              <label className="section-label mb-2 block">
                Min Rating: {filters.rating || 0}★
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating || 0}
                onChange={(e) => onChange({ ...filters, rating: e.target.value })}
                className="w-full accent-[var(--color-brass)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
