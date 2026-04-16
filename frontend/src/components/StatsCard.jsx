export default function StatsCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue:    'bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green:   'bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber:   'bg-amber-100/70 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red:     'bg-red-100/70 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple:  'bg-purple-100/70 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    primary: 'bg-indigo-100/70 dark:bg-purple-900/30 text-indigo-600 dark:text-purple-400',
  };

  return (
    <div className="
      relative overflow-hidden
      card p-5 flex items-center gap-4
      bg-[#e2dad6]/90 
      dark:bg-dark-secondary/70
      backdrop-blur-xl
      border border-white/40 dark:border-white/10
      shadow-lg hover:shadow-2xl
      hover:scale-[1.03]
      transition-all duration-300
      animate-slide-up
      group
    ">

      {/* 🔥 GLOW BACKGROUND */}
      <div className="
        absolute inset-0 opacity-0 group-hover:opacity-100
        bg-gradient-to-br from-indigo-200/20 to-purple-300/20
        dark:from-purple-500/10 dark:to-indigo-500/10
        transition duration-500
      " />

      {/* ICON */}
      <div className={`
        relative z-10
        p-3 rounded-xl flex-shrink-0
        ${colors[color] || colors.primary}
        group-hover:scale-110
        transition-transform duration-300
      `}>
        <Icon className="h-5 w-5" />
      </div>

      {/* TEXT */}
      <div className="relative z-10">
        <p className="
          text-2xl font-bold 
          text-gray-900 dark:text-white
          group-hover:text-indigo-600 dark:group-hover:text-purple-400
          transition-colors
        ">
          {value ?? '—'}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </p>

        {sub && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            {sub}
          </p>
        )}
      </div>

    </div>
  );
}