import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, CheckCircle2, Clock, PlusCircle, ArrowLeft,
  Briefcase, Layers, User, ExternalLink, MessageSquare, Check
} from 'lucide-react';

export default function ProposalDetailPage() {
  const { id } = useParams();
  const { user, isFaculty, isIndustry, isAuthenticated } = useAuth();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  
  // Faculty review modal
  const [facultyFeedback, setFacultyFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState('APPROVED');

  // Industry interest form
  const [companyName, setCompanyName] = useState('UrbanTech Solutions Pvt. Ltd.');
  const [interestType, setInterestType] = useState('PILOT');
  const [interestNotes, setInterestNotes] = useState('');
  const [interestSuccess, setInterestSuccess] = useState(false);

  useEffect(() => {
    loadProposal();
  }, [id]);

  const loadProposal = async () => {
    setLoading(true);
    try {
      const data = await api.getProposalById(id);
      setProposal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await api.addTask(proposal.id, {
        title: taskTitle,
        due_date: taskDue || 'Next Sprint',
        assigned_to: user?.full_name || 'Team Member'
      });
      setTaskTitle('');
      setTaskDue('');
      loadProposal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleMilestone = async (mId) => {
    try {
      await api.toggleMilestone(mId);
      loadProposal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTaskStatus = async (tId, currentStatus) => {
    const nextStatus = currentStatus === 'TODO' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'DONE' : 'TODO';
    try {
      await api.updateTaskStatus(tId, nextStatus);
      loadProposal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFacultyReview = async (e) => {
    e.preventDefault();
    try {
      await api.reviewProposal(proposal.id, {
        status: reviewStatus,
        feedback: facultyFeedback
      });
      alert(`Proposal ${reviewStatus}!`);
      loadProposal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIndustryInterest = async (e) => {
    e.preventDefault();
    try {
      await api.expressIndustryInterest(proposal.id, {
        company_name: companyName,
        interest_type: interestType,
        proposal_notes: interestNotes
      });
      setInterestSuccess(true);
      alert("Interest expression sent to the student engineering team!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-sm text-slate-500">Loading innovation proposal...</div>;
  }

  if (!proposal) {
    return <div className="p-16 text-center text-sm text-slate-500">Proposal not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/solutions" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Solution Hub</span>
        </Link>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {proposal.status}
        </span>
      </div>

      {/* Main Proposal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {proposal.challenge_title || 'Societal Engineering Challenge'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {proposal.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Developed by <strong>{proposal.team_name}</strong> • {proposal.university_name}
          </p>
        </div>

        {/* Faculty Review Feedback Banner (if reviewed) */}
        {proposal.faculty_feedback && (
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-1 text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" /> Faculty Mentor Evaluation ({proposal.status})
            </span>
            <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
              "{proposal.faculty_feedback}"
            </p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Approach</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {proposal.approach}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Technology Stack</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{proposal.tech_stack}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Timeline</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{proposal.timeline_weeks} Weeks</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Expected Impact</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{proposal.expected_impact}</span>
          </div>
        </div>

        {proposal.prototype_url && (
          <div className="pt-2">
            <a
              href={proposal.prototype_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Explore Prototype Code Repository / Simulation Demo &rarr;</span>
            </a>
          </div>
        )}
      </div>

      {/* Grid: Tasks & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Milestones Tracker */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Project Milestones</span>
            </h3>
            <span className="text-xs text-slate-400">
              {proposal.milestones?.filter(m => m.is_completed).length || 0} / {proposal.milestones?.length || 0} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {proposal.milestones && proposal.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => handleToggleMilestone(m.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start space-x-3 ${
                  m.is_completed
                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                  m.is_completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {m.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${m.is_completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {m.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.target_date}</span>
                  </div>
                  {m.description && <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Board */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Sprint Task Board</span>
            </h3>
            <span className="text-xs text-slate-400">{proposal.tasks?.length || 0} Tasks</span>
          </div>

          {/* Quick Add Task */}
          <form onSubmit={handleAddTask} className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Add engineering task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700"
            >
              Add
            </button>
          </form>

          <div className="space-y-2">
            {proposal.tasks && proposal.tasks.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                  <span className="text-[10px] text-slate-400">Assigned: {t.assigned_to || 'Team'} • Due: {t.due_date || 'Sprint'}</span>
                </div>
                <button
                  onClick={() => handleUpdateTaskStatus(t.id, t.status)}
                  className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase transition-colors ${
                    t.status === 'DONE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.status}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Faculty Review Console (shown if active user is faculty or system admin) */}
      {(isFaculty || user?.role === 'SYSTEM_ADMIN') && (
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900 p-6 space-y-3">
          <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Faculty Mentor Review Console</span>
          </h3>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            Submit your formal academic evaluation to approve this proposal or request technical revisions.
          </p>
          <form onSubmit={handleFacultyReview} className="space-y-3 pt-2">
            <div className="flex gap-4">
              <label className="flex items-center space-x-1.5 text-xs text-purple-900 dark:text-purple-200 font-bold">
                <input
                  type="radio"
                  name="reviewStatus"
                  value="APPROVED"
                  checked={reviewStatus === 'APPROVED'}
                  onChange={(e) => setReviewStatus(e.target.value)}
                />
                <span>Approve Proposal</span>
              </label>
              <label className="flex items-center space-x-1.5 text-xs text-purple-900 dark:text-purple-200 font-bold">
                <input
                  type="radio"
                  name="reviewStatus"
                  value="REVISION_REQUESTED"
                  checked={reviewStatus === 'REVISION_REQUESTED'}
                  onChange={(e) => setReviewStatus(e.target.value)}
                />
                <span>Request Revisions</span>
              </label>
            </div>
            <textarea
              rows={2}
              required
              value={facultyFeedback}
              onChange={(e) => setFacultyFeedback(e.target.value)}
              placeholder="Faculty evaluation feedback, experimental benchmarks, or suggestions for the team..."
              className="w-full p-2.5 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md"
            >
              Submit Evaluation
            </button>
          </form>
        </div>
      )}

      {/* Industry Partner Collaboration Card */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900 p-6 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Industry Partnership & Pilot Trial Inquiries</span>
          </h3>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
            Companies and civic contractors can express interest in sponsoring pilot deployments, cloud resources, or technical mentorship.
          </p>
        </div>

        {interestSuccess ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold">
            Your collaboration inquiry has been routed to the student team lead and faculty mentor!
          </div>
        ) : (
          <form onSubmit={handleIndustryInterest} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Collaboration Type</label>
                <select
                  value={interestType}
                  onChange={(e) => setInterestType(e.target.value)}
                  className="w-full p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="PILOT">Pilot Trial Deployment</option>
                  <option value="MENTORSHIP">Technical Mentorship</option>
                  <option value="RESOURCE_SUPPORT">Cloud / Hardware Sponsorship</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                required
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                placeholder="Briefly state how your company can support this project..."
                className="w-full p-2.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md"
            >
              Express Collaboration Interest
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

