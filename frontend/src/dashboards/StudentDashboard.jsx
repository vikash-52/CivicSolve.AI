import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, PlusCircle, ArrowRight, CheckCircle2,
  Clock, FileText, Layers, ExternalLink
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'all'
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [activeTab]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const data = activeTab === 'my'
        ? await api.getProposals({ my_proposals: 'true' })
        : await api.getProposals();
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      try {
        const allData = await api.getProposals();
        setProposals(Array.isArray(allData) ? allData : []);
      } catch (e) {
        setProposals([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Student Innovation Team Workspace
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {user?.full_name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your societal challenge proposals, sprint tasks, and faculty reviews.
          </p>
        </div>

        <Link
          to="/solutions"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Browse Challenges</span>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          My Team's Proposals
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          All Campus & SIH Proposals
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {activeTab === 'my' ? "My Team's Submissions" : "All University Submissions"} ({proposals.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {activeTab === 'my' 
                ? "No proposals submitted yet by your team." 
                : "No campus proposals found."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeTab === 'my' && (
                <button 
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200"
                >
                  View All Campus Proposals
                </button>
              )}
              <Link to="/solutions" className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700">
                Explore Active Challenges
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-600">{p.team_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3">{p.approach}</p>

                  {p.faculty_feedback && (
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 text-xs">
                      <strong>Faculty Note:</strong> "{p.faculty_feedback}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {p.milestones?.filter(m => m.is_completed).length || 0}/{p.milestones?.length || 0} Milestones
                  </span>
                  <Link
                    to={`/solutions/proposals/${p.id}`}
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Manage Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

