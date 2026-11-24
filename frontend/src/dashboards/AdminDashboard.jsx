import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, CheckCircle2, XCircle, UserCheck, AlertTriangle,
  Building2, Users, FileText, ArrowRight, RefreshCw, Cpu
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingIssues, setPendingIssues] = useState([]);
  const [unassignedIssues, setUnassignedIssues] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active admin tab: 'verification', 'assignment', 'users', 'audit'
  const [activeTab, setActiveTab] = useState('verification');

  // Verify modal state
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [verifyCategory, setVerifyCategory] = useState('');
  const [verifyPriority, setVerifyPriority] = useState('HIGH');
  const [rejectionReason, setRejectionReason] = useState('');

  // Assign modal state
  const [assignIssue, setAssignIssue] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, pendingData, verifiedData, usersData, deptsData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingVerification(),
        api.getProblems({ status: 'VERIFIED' }),
        api.getAllUsers(),
        api.getDepartments(),
        api.getAuditLogs()
      ]);
      setStats(statsData);
      setPendingIssues(pendingData);
      setUnassignedIssues(verifiedData.filter(i => !i.assigned_officer_id));
      setAllUsers(usersData);
      setDepartments(deptsData);
      setAuditLogs(logsData);

      // Load officers
      if (deptsData.length > 0) {
        const offList = await api.getDepartmentOfficers(deptsData[0].id);
        setOfficers(offList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVerifyModal = (issue) => {
    setSelectedIssue(issue);
    setVerifyCategory(issue.category);
    setVerifyPriority(issue.priority);
  };

  const handleVerifySubmit = async (isVerified) => {
    try {
      await api.verifyProblem(selectedIssue.id, {
        is_verified: isVerified,
        rejection_reason: isVerified ? undefined : (rejectionReason || "Does not meet municipal validation criteria"),
        adjusted_category: verifyCategory,
        adjusted_priority: verifyPriority
      });
      setSelectedIssue(null);
      setRejectionReason('');
      alert(isVerified ? "Report verified successfully!" : "Report rejected with reason.");
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenAssignModal = (issue) => {
    setAssignIssue(issue);
    setSelectedDeptId(departments[0]?.id || '');
    setSelectedOfficerId(officers[0]?.id || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.assignProblem(assignIssue.id, {
        department_id: parseInt(selectedDeptId),
        officer_id: selectedOfficerId ? parseInt(selectedOfficerId) : undefined,
        notes: assignNotes
      });
      setAssignIssue(null);
      setAssignNotes('');
      alert("Assigned successfully to department and officer!");
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (!confirm(`Are you sure you want to change user role to ${newRole}?`)) return;
    try {
      await api.updateUserRole(targetUserId, newRole);
      alert("User role updated successfully in database!");
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              System Administration Console
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              Admin Access Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authenticate citizen complaints, verify NLP priority scores, route cases, and audit privileged operations.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Queues</span>
        </button>
      </div>

      {/* Admin Stat Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Reports</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats?.total_reports || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-purple-600">Pending Triage</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-0.5">{stats?.pending_verification || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-amber-600">Unassigned</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{stats?.unassigned || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-blue-600">In Progress</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-0.5">{stats?.in_progress || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{stats?.resolved || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats?.total_users || 0}</p>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'verification'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Verification ({pendingIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('assignment')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'assignment'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Assign Department ({unassignedIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User & Role Management ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: PENDING VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Grievances Awaiting Authenticity Verification</span>
            <span className="text-slate-500">Sorted by highest AI Priority Score</span>
          </div>

          {pendingIssues.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No pending reports in verification queue! All submissions authenticated.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingIssues.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{p.report_id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
                        {p.priority} • {p.priority_score?.toFixed(1)}/100
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{p.category}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
                    
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Location: {p.address}, {p.locality}</span>
                      <span>Recommended: <strong>{p.ai_analysis?.recommended_department || 'General Cell'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/issues/${p.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleOpenVerifyModal(p)}
                      className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                    >
                      Review & Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNASSIGNED ISSUES QUEUE */}
      {activeTab === 'assignment' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Verified Issues Pending Department & Officer Assignment</span>
            <span className="text-slate-500">{unassignedIssues.length} Queued</span>
          </div>

          {unassignedIssues.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No unassigned issues in queue. All verified complaints routed to field teams!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {unassignedIssues.map((p) => (
                <div key={p.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-600">{p.report_id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">VERIFIED</span>
                      <span className="text-xs font-medium text-slate-500">{p.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h3>
                    <p className="text-xs text-slate-500">{p.address}, {p.locality}</p>
                  </div>
                  <button
                    onClick={() => handleOpenAssignModal(p)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                  >
                    Assign Department & Officer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            Registered Platform Accounts & Permitted Roles
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3">Jurisdiction / Org</th>
                  <th className="px-4 py-3">Promote / Adjust Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.jurisdiction || u.organization || 'General'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="CITIZEN">CITIZEN</option>
                        <option value="AUTHORITY_OFFICER">AUTHORITY_OFFICER</option>
                        <option value="GOVERNMENT_OFFICIAL">GOVERNMENT_OFFICIAL</option>
                        <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                        <option value="STUDENT_TEAM">STUDENT_TEAM</option>
                        <option value="FACULTY_MENTOR">FACULTY_MENTOR</option>
                        <option value="INDUSTRY_PARTNER">INDUSTRY_PARTNER</option>
                        <option value="UNIVERSITY_TEAM">UNIVERSITY_TEAM</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            Immutable Audit Trail of Privileged Administrative Actions
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-600 font-mono text-[11px]">{log.action}</span>
                    <span className="text-slate-500">• Actor: {log.user_email || 'System'}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATION MODAL DIALOG */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Verify Complaint: {selectedIssue.report_id}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{selectedIssue.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg">
              {selectedIssue.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Category</label>
                <input
                  type="text"
                  value={verifyCategory}
                  onChange={(e) => setVerifyCategory(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Priority</label>
                <select
                  value={verifyPriority}
                  onChange={(e) => setVerifyPriority(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Rejection Reason (if declining)</label>
              <input
                type="text"
                placeholder="Only required if rejecting complaint..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit(false)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Reject Complaint
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit(true)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
              >
                Verify & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENT MODAL DIALOG */}
      {assignIssue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assign Grievance: {assignIssue.report_id}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{assignIssue.title}</p>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsible Municipal Department *
                </label>
                <select
                  required
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Authority Field Officer
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                >
                  <option value="">-- Auto-assign to Department Pool --</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.full_name} ({o.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Directives / SLA Target Notes
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Inspect within 24 hours. Cold-mix patch crew dispatched."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignIssue(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

