import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { DoctorCard } from '../../components/DoctorCard';
import { SearchFilters } from '../../components/SearchFilters';
import { PageHeader } from '../../components/shared/PageHeader';
import { ListSkeleton } from '../../components/shared/Skeleton';

export default function FindDoctors() {
  const [filters, setFilters] = useState({ disease: '', city: '', type: '', rating: '' });
  const debounced = useDebounce(filters, 300);
  const [page, setPage] = useState(1);

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
    <div className="space-y-6">
      <PageHeader label="Directory" title="Find Physicians" description="Browse our curated registry of verified practitioners." />
      {error && (
        <p className="rounded-xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-alert">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <SearchFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <ListSkeleton count={6} />
          ) : (
            <>
              <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data?.doctors?.map((doc, i) => (
                  <DoctorCard key={doc._id} doctor={doc} index={i} />
                ))}
              </motion.div>

              {data?.doctors?.length === 0 && (
                <p className="py-12 text-center text-white/50">No doctors match your filters.</p>
              )}

              {data?.pages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn-ghost text-sm"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm text-white/50">
                    Page {page} of {data.pages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-ghost text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
