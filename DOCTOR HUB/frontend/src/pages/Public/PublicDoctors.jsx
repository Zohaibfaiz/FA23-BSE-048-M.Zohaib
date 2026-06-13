import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { PublicDoctorCard } from '../../components/public/PublicDoctorCard';
import { PAKISTAN_CITIES } from '../../utils/constants';

export default function PublicDoctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    disease: searchParams.get('disease') || '',
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    rating: searchParams.get('rating') || '',
  });
  const debounced = useDebounce(filters, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.disease) params.set('disease', filters.disease);
    if (filters.city) params.set('city', filters.city);
    if (filters.type) params.set('type', filters.type);
    if (filters.rating) params.set('rating', filters.rating);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { data, loading, error } = useFetch(async () => {
    const params = new URLSearchParams();
    if (debounced.disease) params.set('disease', debounced.disease);
    if (debounced.city) params.set('city', debounced.city);
    if (debounced.type) params.set('type', debounced.type);
    if (debounced.rating) params.set('rating', debounced.rating);
    params.set('page', page);
    const { data: res } = await api.get(`/doctors?${params}`);
    return res;
  }, [debounced.disease, debounced.city, debounced.type, debounced.rating, page]);

  return (
    <div className="page-shell py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Directory</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find Doctors</h1>
        <p className="mt-2 text-muted-fg">Search verified healthcare professionals across Pakistan</p>
      </div>

      <div className="glass-public p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            className="input-public"
            placeholder="Disease or specialty"
            value={filters.disease}
            onChange={(e) => { setFilters({ ...filters, disease: e.target.value }); setPage(1); }}
          />
          <select
            className="input-public"
            value={filters.city}
            onChange={(e) => { setFilters({ ...filters, city: e.target.value }); setPage(1); }}
          >
            <option value="">All cities</option>
            {PAKISTAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="input-public"
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          >
            <option value="">All types</option>
            <option value="allopathic">Allopathic</option>
            <option value="homeopathic">Homeopathic</option>
            <option value="herbal">Herbal</option>
          </select>
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-muted-fg whitespace-nowrap">Min {filters.rating || 0}★</span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.rating || 0}
              onChange={(e) => { setFilters({ ...filters, rating: e.target.value }); setPage(1); }}
              className="w-full accent-[#2563eb]"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="premium-card h-72 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : (
        <>
          <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.doctors?.map((doc, i) => (
              <PublicDoctorCard key={doc._id} doctor={doc} index={i} />
            ))}
          </motion.div>

          {data?.doctors?.length === 0 && (
            <p className="py-16 text-center text-muted-fg">No doctors match your filters.</p>
          )}

          {data?.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary-public text-sm"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-muted-fg">
                Page {page} of {data.pages}
              </span>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary-public text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
