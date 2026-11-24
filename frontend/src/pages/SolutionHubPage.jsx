import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Sparkles, PlusCircle, ArrowRight, CheckCircle2,
  Briefcase, Building2, Layers, Cpu, Code2, Users, FileText
} from 'lucide-react';

export default function SolutionHubPage() {
  const { user, isAuthenticated, isStudent, isFaculty, isIndustry } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Proposal modal form state
  const [proposalForm, setProposalForm] = useState({
    title: '',
    team_name: 'Team Innovators',
    university_name: 'National Institute of Technology',
    approach: '',
    tech_stack: 'Python, PyTorch, React, IoT Sensors',
    expected_impact: '',
    timeline_weeks: 10,
    prototype_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [challengesData, proposalsData] = await Promise.all([
        api.getChallenges().catch(err => {
          console.error("Challenges error:", err);
          return [];
        }),
        api.getProposals().catch(err => {
          console.error("Proposals error:", err);
          return [];
        })
      ]);
      setChallenges(Array.isArray(challengesData) ? challengesData : []);
      setProposals(Array.isArray(proposalsData) ? proposalsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (challenge) => {
    setSelectedChallenge(challenge);
    setShowSubmitModal(true);
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert("Please sign in or use the Evaluator Switcher first!");
    try {
      await api.createProposal({
        ...proposalForm,
        challenge_id: selectedChallenge.id
      });
      setShowSubmitModal(false);
      alert("Proposal submitted for faculty mentor review!");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-purple-300" />
            <span>Smart India Hackathon & University Cell Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Societal Innovation & Solution Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Collaborative sandbox for universities, student engineering teams, faculty mentors, and industry partners to develop scalable prototypes for persistent societal challenges.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Distinct from Municipal Grievance SLA
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Faculty Review & Milestone Tracking
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: APPROVED CHALLENGES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Approved Societal Challenges
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-impact civic problems suitable for university research, AI prototypes, and IoT deployments.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {challenges.length} Active Challenges
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {c.code}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {c.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.problem_statement}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="text-slate-400">Target Outcome:</span> {c.desired_outcomes}
                  </div>
                  {c.required_skills && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Skills:</strong> {c.required_skills}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {c.proposals_count} Team Proposal(s) Submitted
                </span>
                <button
                  onClick={() => handleOpenSubmit(c)}
                  className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit Solution Proposal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: SUBMITTED PROPOSALS GALLERY */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Student Innovation Proposals & Roadmaps
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Peer projects submitted by university teams across India with faculty review status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {proposals.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">{p.university_name}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    p.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {p.approach}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div><strong>Team:</strong> {p.team_name}</div>
                  <div><strong>Stack:</strong> {p.tech_stack}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {p.milestones?.length || 0} Milestones • {p.tasks?.length || 0} Tasks
                </span>
                <Link
                  to={`/solutions/proposals/${p.id}`}
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
                >
                  <span>View Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROPOSAL SUBMISSION MODAL */}
      {showSubmitModal && selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-brand-600">{selectedChallenge.code}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Solution Proposal</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  required
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})}
                  placeholder="e.g. Acoustic Hydrophone IoT Mesh for Sub-surface Leak Detection"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.team_name}
                    onChange={(e) => setProposalForm({...proposalForm, team_name: e.target.value})}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    University / College *
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.university_name}
                    onChange={(e) => setProposalForm({...proposalForm, university_name: e.target.value})}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Technical Approach & Methodology *
                </label>
                <textarea
                  rows={3}
                  required
                  value={proposalForm.approach}
                  onChange={(e) => setProposalForm({...proposalForm, approach: e.target.value})}
                  placeholder="Detail your algorithmic design, hardware components, signal processing or AI models..."
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Technology Stack
                  </label>
                  <input
                    type="text"
                    value={proposalForm.tech_stack}
                    onChange={(e) => setProposalForm({...proposalForm, tech_stack: e.target.value})}
                    placeholder="e.g. PyTorch, LoRaWAN, STM32"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Timeline (Weeks)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={52}
                    value={proposalForm.timeline_weeks}
                    onChange={(e) => setProposalForm({...proposalForm, timeline_weeks: parseInt(e.target.value) || 8})}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Expected Societal Impact
                </label>
                <textarea
                  rows={2}
                  value={proposalForm.expected_impact}
                  onChange={(e) => setProposalForm({...proposalForm, expected_impact: e.target.value})}
                  placeholder="Quantifiable benefits (e.g. 30% reduction in water loss, 40 hours saved per survey)..."
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

