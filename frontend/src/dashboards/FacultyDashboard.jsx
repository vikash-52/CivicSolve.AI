import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Layers, CheckCircle2, ArrowRight, Clock, RefreshCw, FileText
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await api.getProposals();
      setProposals(data);
    } catch (err) {
      console.error(err);
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
              Faculty Mentor Evaluation Console
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {user?.full_name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student engineering submissions, provide academic mentorship feedback, and track milestones.
          </p>
        </div>

        <button
          onClick={loadProposals}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Submissions</span>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Student Proposals Under Mentorship ({proposals.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading student proposals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-600">{p.team_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3">{p.approach}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{p.university_name}</span>
                  <Link
                    to={`/solutions/proposals/${p.id}`}
                    className="font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <span>Evaluate & Feedback</span>
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

