import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  RefreshCw, MapPin, Wrench, ShieldCheck, FileCheck
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Status update modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [progressNotes, setProgressNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, [statusFilter]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await api.getOfficerAssignments(statusFilter !== 'All' ? statusFilter : '');
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (c) => {
    setSelectedCase(c);
    // Suggest next logical status
    if (c.status === 'ASSIGNED') setNewStatus('IN_PROGRESS');
    else if (c.status === 'IN_PROGRESS') setNewStatus('RESOLVED');
    else if (c.status === 'RESOLVED') setNewStatus('CLOSED');
    else setNewStatus('IN_PROGRESS');
    setProgressNotes('');
    setEvidenceUrl('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!progressNotes.trim()) {
      alert("Please provide progress notes explaining field actions taken");
      return;
    }
    setUpdating(true);
    try {
      await api.updateProblemStatus(selectedCase.id, {
        new_status: newStatus,
        notes: progressNotes,
        resolution_evidence_url: evidenceUrl || undefined
      });
      setSelectedCase(null);
      alert(`Case updated to ${newStatus}! Timeline updated and citizen notified.`);
      loadAssignments();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Authority Field Officer Console
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {user?.full_name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assigned municipal cases within your jurisdiction. Log field inspections, update progress, and register resolution evidence.
          </p>
        </div>

        <button
          onClick={loadAssignments}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Cases</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {['All', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No assigned cases matching filter.</p>
          <p className="text-xs text-slate-500">All current assignments within your division are up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-brand-600">{c.report_id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                    c.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700' :
                    'bg-indigo-50 text-indigo-700'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                    {c.priority} ({c.priority_score?.toFixed(0)}/100)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{c.category}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>

                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                  <span>Location: {c.address}, {c.locality}</span>
                  <span>Citizen: {c.citizen_name || 'Anonymous'}</span>
                  {c.resolution_notes && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-xs">
                      Latest Note: {c.resolution_notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to={`/issues/${c.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100"
                >
                  Details
                </Link>
                <button
                  onClick={() => handleOpenStatusModal(c)}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                >
                  Update Status & Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE STATUS MODAL DIALOG */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div>
              <span className="text-xs font-mono font-bold text-brand-600">{selectedCase.report_id}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Case Progress: {selectedCase.title}
              </h3>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Status Transition *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS (Team Dispatched / Working)</option>
                  <option value="RESOLVED">RESOLVED (Repairs / Work Finished)</option>
                  <option value="CLOSED">CLOSED (Officially Signed Off)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Progress / Resolution Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Detail the materials used, team dispatched, asphalt laid, or cause of resolution..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {newStatus === 'RESOLVED' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resolution Evidence Image URL (Proof of Repair)
                  </label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://civicsolve.demo/evidence/repair-finished.jpg"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {updating ? 'Saving Status...' : 'Commit Status & Notify Citizen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

