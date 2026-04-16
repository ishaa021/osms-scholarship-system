import { Calendar, DollarSign, Building2, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from './ui/Badge';

export default function ScholarshipCard({ s }) {
  const navigate = useNavigate();
  const isExpired = new Date(s.deadline) < new Date();

  return (
    <div
      className="
        card p-5 flex flex-col gap-4 group cursor-pointer
        bg-[#e2dad6]/90 
        dark:bg-dark-secondary/70
        backdrop-blur-xl
        border border-white/40 dark:border-white/10
        shadow-lg hover:shadow-2xl
        hover:scale-[1.02]
        transition-all duration-300
      "
      onClick={() => navigate(`/scholarships/${s._id}`)}
    >

      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status={s.type} />
            {isExpired && <span className="badge-rejected">Expired</span>}
          </div>

          <h3 className="
            font-semibold text-gray-900 dark:text-white text-base leading-snug
            group-hover:text-indigo-600 dark:group-hover:text-purple-400
            transition-colors
          ">
            {s.title}
          </h3>
        </div>

        {/* ICON */}
        <div className="
          flex-shrink-0 p-2 rounded-xl
          bg-indigo-100/70 dark:bg-purple-900/30
          group-hover:scale-110
          transition-all duration-300
        ">
          <Building2 className="h-4 w-4 text-indigo-600 dark:text-purple-400" />
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="
        text-sm text-gray-600 dark:text-gray-400
        line-clamp-2 leading-relaxed
      ">
        {s.description}
      </p>

      {/* META */}
      <div className="grid grid-cols-2 gap-3">

        <div className="flex items-center gap-1.5 text-xs">
          <span className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-semibold text-gray-900 dark:text-white">
            ₹{s.amount?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {new Date(s.deadline).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>

      </div>

      {/* FOOTER */}
      <div className="
        pt-2 mt-1
        border-t border-white/30 dark:border-white/10
        flex items-center justify-between
      ">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {s.organizationName}
        </span>

        {s.type === 'external'
          ? (
            <ExternalLink className="
              h-4 w-4 text-gray-400
              group-hover:text-indigo-500 dark:group-hover:text-purple-400
              transition-colors
            " />
          )
          : (
            <ArrowRight className="
              h-4 w-4 text-gray-400
              group-hover:text-indigo-500 dark:group-hover:text-purple-400
              transition-colors
            " />
          )
        }
      </div>

    </div>
  );
}