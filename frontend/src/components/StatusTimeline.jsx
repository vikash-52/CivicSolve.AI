import React from 'react';
import { CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';

export default function StatusTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 text-center">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
      {timeline.map((event, idx) => {
        const dateStr = new Date(event.created_at).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const isLatest = idx === 0;

        return (
          <div key={event.id || idx} className="relative">
            {/* Circle dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isLatest
                  ? 'bg-brand-600 border-white dark:border-slate-900 text-white shadow-sm ring-4 ring-brand-100 dark:ring-brand-950'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-white' : 'bg-slate-400'}`}></div>
            </div>

            {/* Event Content */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-1.5">
                  {event.previous_status && (
                    <>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {event.previous_status}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </>
                  )}
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {event.new_status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dateStr}
                </span>
              </div>

              {event.notes && (
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {event.notes}
                </p>
              )}

              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3 h-3 text-slate-400" />
                  {event.changed_by_name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                  {event.changed_by_role}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

