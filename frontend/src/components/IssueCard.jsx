import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ThumbsUp, MessageSquare, AlertTriangle,
  Clock, CheckCircle2, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';

const STATUS_CONFIG = {
  REPORTED: { label: 'Reported', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  VERIFIED: { label: 'Verified', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  ASSIGNED: { label: 'Assigned', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  RESOLVED: { label: 'Resolved', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
};

const PRIORITY_CONFIG = {
  CRITICAL: { label: 'Critical', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  HIGH: { label: 'High', bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  LOW: { label: 'Low', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
};

export default function IssueCard({ issue, onVote }) {
  const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.REPORTED;
  const priorityInfo = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;

  const formattedDate = new Date(issue.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner / Tags */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {issue.report_id}
          </span>
          <div className="flex items-center space-x-1.5">
            {issue.is_demo && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Demo Data
              </span>
            )}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Priority & Category */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityInfo.bg}`}>
            {priorityInfo.label} • {issue.priority_score?.toFixed(0)}/100
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80">
            {issue.category}
          </span>
        </div>

        {/* Title */}
        <Link to={`/issues/${issue.id}`} className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {issue.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {issue.description}
        </p>

        {/* Location & Date */}
        <div className="mt-3.5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{issue.locality ? `${issue.locality}, ${issue.city}` : issue.address}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Submitted on {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => onVote && onVote(issue.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              issue.has_voted
                ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-950/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50'
            }`}
            title="Support this community grievance"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${issue.has_voted ? 'fill-current' : ''}`} />
            <span>{issue.votes_count}</span>
          </button>

          <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{issue.comments_count}</span>
          </span>
        </div>

        <Link
          to={`/issues/${issue.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

    </div>
  );
}

