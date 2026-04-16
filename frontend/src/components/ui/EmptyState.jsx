export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="
      flex flex-col items-center justify-center text-center
      py-16 px-4
      animate-fade-in
    ">

      {/* ICON */}
      {Icon && (
        <div className="
          p-5 mb-5
          rounded-2xl
          bg-[#e2dad6]/80 
          dark:bg-dark-secondary/60
          backdrop-blur-xl
          border border-white/40 dark:border-white/10
          shadow-lg
          animate-pulse
        ">
          <Icon className="h-8 w-8 text-gray-500 dark:text-gray-300" />
        </div>
      )}

      {/* TITLE */}
      <h3 className="
        text-lg font-semibold
        text-gray-800 dark:text-white
        mb-2
      ">
        {title}
      </h3>

      {/* DESCRIPTION */}
      <p className="
        text-sm max-w-md
        text-gray-1000 dark:text-gray-400
        mb-5 leading-relaxed
      ">
        {description}
      </p>

      {/* ACTION */}
      {action && (
        <div className="animate-slide-up">
          {action}
        </div>
      )}

    </div>
  );
}