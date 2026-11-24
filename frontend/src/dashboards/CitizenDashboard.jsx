import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import {
  FileText, Clock, AlertTriangle, CheckCircle2, Bookmark,
  PlusCircle, RefreshCw, User, MapPin, Camera, Video
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my_reports'); // my_reports, saved
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my_reports') {
        const data = await api.getProblems({ my_reports: true });
        setIssues(data);
      } else {
        const data = await api.getProblems({ saved_only: true });
        setIssues(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    try {
      await api.voteProblem(id);
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const myTotal = issues.length;
  const inReview = issues.filter(i => i.status === 'REPORTED' || i.status === 'UNDER_REVIEW').length;
  const inProgress = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
  const resolved = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Citizen Portal
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {user?.full_name || 'Citizen'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your submitted municipal grievances and community bookmarks in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            to="/report"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Camera & GPS Report</span>
          </Link>
          <Link
            to="/report"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Form</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Submitted</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{myTotal}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Total Grievances</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">In Triage</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">{inReview}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting Verification</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">In Progress</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{inProgress}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Field Work Active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{resolved}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Verified Solutions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('my_reports')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'my_reports'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            My Reports ({myTotal})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Community Issues</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {activeTab === 'my_reports' ? "You haven't reported any civic issues yet." : "No saved issues in your bookmark list."}
            </p>
            {activeTab === 'my_reports' && (
              <Link
                to="/report"
                className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs"
              >
                Report a Pothole or Leak Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

