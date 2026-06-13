import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useFetch = (fetcher, deps = [], { enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    queueMicrotask(refetch);
  }, [refetch, depsKey]);

  return { data, loading, error, refetch, setData };
};
