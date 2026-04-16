export default function Badge({ status }) {
  const map = {
    pending:   'badge-pending',
    approved:  'badge-approved',
    rejected:  'badge-rejected',
    withdrawn: 'badge-withdrawn',
    internal:  'badge-internal',
    external:  'badge-external',
  };

  return (
    <span
      className={`
        ${map[status] || 'badge-pending'}
        capitalize
        px-3 py-1
        rounded-full
        text-xs font-semibold
        tracking-wide
        backdrop-blur-sm
        transition-all duration-200
        hover:scale-105
      `}
    >
      {status}
    </span>
  );
}