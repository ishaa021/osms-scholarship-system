export default function Spinner({ size = 'md' }) {
  const s = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size];

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${s}
          animate-spin rounded-full border-2
          border-white/30
          border-t-indigo-500
          dark:border-white/20
          dark:border-t-purple-400
          shadow-md
        `}
      />
    </div>
  );
}