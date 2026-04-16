import { useEffect, useState, useCallback } from 'react';
import { getScholarships } from '../../services/api';
import ScholarshipCard from '../../components/ScholarshipCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import { Search, Filter, BookOpen, X } from 'lucide-react';

export default function BrowseScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (activeOnly) params.active = 'true';
    getScholarships(params)
      .then(r => setScholarships(r.data.scholarships))
      .finally(() => setLoading(false));
  }, [search, type, activeOnly]);

  useEffect(() => {
    const t = setTimeout(fetch, 400);
    return () => clearTimeout(t);
  }, [fetch]);

  const clearFilters = () => { setSearch(''); setType(''); setActiveOnly(false); };
  const hasFilters = search || type || activeOnly;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Browse Scholarships</h1>
        <p className="text-sm text-gray-900 dark:text-gray-400 mt-0.5">Find scholarships from your institution</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search scholarships..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto min-w-[140px]" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="internal">Internal</option>
          <option value="external">External</option>
        </select>
        <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} className="accent-primary-600" />
          Active only
        </label>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-secondary gap-1.5">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-900 dark:text-gray-400">
          Showing <span className="font-medium text-gray-900 dark:text-white">{scholarships.length}</span> scholarship{scholarships.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : scholarships.length === 0 ? (
        <EmptyState icon={BookOpen} title="No scholarships found"
          description="Try adjusting your search or filters"
          action={hasFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : null} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scholarships.map(s => <ScholarshipCard key={s._id} s={s} />)}
        </div>
      )}
    </div>
  );
}