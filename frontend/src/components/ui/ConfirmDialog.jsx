import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger
}) {
  if (!open) return null;

  return (
    <div className="
      fixed inset-0 z-50 flex items-center justify-center p-4
      backdrop-blur-md
      bg-[#6482ad]/40 dark:bg-[#9483f2]/30
      animate-fade-in
    ">

      <div className="
        card w-full max-w-sm p-6
        animate-slide-up
        bg-[#e2dad6]/95 
        dark:bg-dark-secondary/80
        backdrop-blur-xl
        border border-white/40 dark:border-white/10
        shadow-2xl
      ">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">

          {/* ICON */}
          <div className={`
            p-2 rounded-xl
            ${danger
              ? 'bg-red-200/60 dark:bg-red-900/30'
              : 'bg-amber-200/60 dark:bg-amber-900/30'}
          `}>
            <AlertTriangle
              className={`
                h-5 w-5
                ${danger ? 'text-red-600' : 'text-amber-600'}
              `}
            />
          </div>

          {/* TITLE */}
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* MESSAGE */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        {/* ACTIONS */}
        <div className="flex gap-3 justify-end">

          <button
            onClick={onCancel}
            className="
              btn-secondary
              hover:scale-105
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`
              ${danger ? 'btn-danger' : 'btn-primary'}
              hover:scale-105
            `}
          >
            Confirm
          </button>

        </div>
      </div>
    </div>
  );
}