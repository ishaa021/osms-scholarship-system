export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="
      card p-5
      bg-[#e2dad6]/80 
      dark:bg-dark-secondary/60
      backdrop-blur-xl
      border border-white/40 dark:border-white/10
      shadow-lg
      overflow-hidden
      relative
    ">

      {/* 🔥 SHIMMER EFFECT */}
      <div className="
        absolute inset-0 
        -translate-x-full
        bg-gradient-to-r 
        from-transparent 
        via-white/40 
        to-transparent
        animate-[shimmer_1.5s_infinite]
      " />

      {/* TITLE */}
      <div className="h-5 bg-gray-300/70 dark:bg-gray-700/60 rounded-lg w-2/3 mb-4" />

      {/* LINES */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`
            h-3 rounded mb-2
            bg-gray-200/70 dark:bg-gray-800/60
            ${i === lines - 1 ? 'w-1/2' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
}