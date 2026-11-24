import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import {
  MapPin, Clock, ThumbsUp, Bookmark, Share2, MessageSquare,
  AlertTriangle, CheckCircle2, Building2, User, Cpu,
  Sparkles, ArrowLeft, Send, Star, ShieldCheck, Tag
} from 'lucide-react';

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [duplicates, setDuplicates] = useState([]);

  useEffect(() => {
    loadIssueDetails();
  }, [id]);

  const loadIssueDetails = async () => {
    setLoading(true);
    try {
      const [issueData, commentsData, dupData] = await Promise.all([
        api.getProblemById(id),
        api.getComments(id),
        api.getDuplicates(id).catch(() => [])
      ]);
      setIssue(issueData);
      setComments(commentsData);
      setDuplicates(dupData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to support this issue");
      return;
    }
    try {
      if (issue.has_voted) {
        await api.removeVote(issue.id);
      } else {
        await api.voteProblem(issue.id);
      }
      loadIssueDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return alert("Please sign in to save issues");
    try {
      if (issue.is_saved) {
        await api.unsaveProblem(issue.id);
      } else {
        await api.saveProblem(issue.id);
      }
      loadIssueDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.addComment(issue.id, newComment);
      setNewComment('');
      const updated = await api.getComments(issue.id);
      setComments(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.submitFeedback(issue.id, {
        rating: feedbackRating,
        satisfaction_level: feedbackRating >= 4 ? 'Highly Satisfied' : 'Neutral',
        comments: feedbackText
      });
      setFeedbackSubmitted(true);
      alert("Thank you! Your feedback has been recorded.");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500">Loading civic report details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-base font-bold text-slate-800 dark:text-slate-200">Grievance report not found</p>
        <Link to="/issues" className="mt-4 inline-block px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold">
          Return to All Issues
        </Link>
      </div>
    );
  }

  const isReporter = user && user.id === issue.citizen_id;
  const isResolved = issue.status === 'RESOLVED' || issue.status === 'CLOSED';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top back navigation & ID bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/issues"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Issues</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {issue.report_id}
          </span>
          {issue.is_demo && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Demo Data
            </span>
          )}
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            {issue.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Side Timeline/AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Title, Description, Attachments, Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {issue.category}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {issue.priority} Priority
              </span>
              {issue.safety_hazard && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Safety Hazard
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {issue.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-1 border-y border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {issue.address} {issue.locality && `(${issue.locality})`}, {issue.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Reported {new Date(issue.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Problem Description</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>

            {/* Evidence Attachments */}
            {issue.attachments && issue.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Evidence (Photos & Videos)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {issue.attachments.map(att => {
                    const isVideo = att.file_type?.startsWith('video/') ||
                      ['.mp4', '.webm', '.mov', '.mkv'].some(ext => att.original_filename?.toLowerCase().endsWith(ext));

                    return (
                      <div
                        key={att.id}
                        className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col justify-between"
                      >
                        {isVideo ? (
                          <div className="aspect-video bg-black flex items-center justify-center">
                            <video
                              src={att.file_path}
                              controls
                              className="w-full h-full object-contain"
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <a
                            href={att.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block aspect-video relative overflow-hidden"
                          >
                            <img
                              src={att.file_path}
                              alt="Evidence"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </a>
                        )}
                        <div className="p-2 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60">
                          <span className="truncate">{att.original_filename}</span>
                          <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                            {isVideo ? 'VIDEO' : 'PHOTO'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resolution Evidence if resolved */}
            {issue.resolution_notes && (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authority Resolution Report</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  {issue.resolution_notes}
                </p>
                {issue.resolution_evidence_url && (
                  <a
                    href={issue.resolution_evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[11px] font-semibold text-emerald-700 hover:underline pt-1"
                  >
                    View Field Resolution Proof &rarr;
                  </a>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVote}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    issue.has_voted
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{issue.has_voted ? 'Supported' : 'Support Issue'} ({issue.votes_count})</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    issue.is_saved
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{issue.is_saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Assigned: <span className="font-semibold text-slate-700 dark:text-slate-300">{issue.assigned_department_name || 'Queued for Assignment'}</span>
              </div>
            </div>

          </div>

          {/* Citizen Feedback Form (if resolved & reported by current user) */}
          {isResolved && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Citizen Resolution Feedback</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rate the quality and speed of the municipal resolution work done on this grievance.
              </p>

              {feedbackSubmitted ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-medium">
                  Thank you! Your feedback has been verified and registered into municipal performance records.
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Satisfaction Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 rounded text-sm ${feedbackRating >= star ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {feedbackRating}/5 Stars
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Optional notes on the work quality, cleanliness, or remaining concerns..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    Submit Citizen Rating
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Comments Thread */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Community Discussion ({comments.length})</span>
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share local insights or updates regarding this grievance..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 text-center">
                <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link> to participate in the civic discussion.
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No comments posted yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{c.user.full_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {c.user.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): AI Insights Card, Duplicate Candidates, Status Timeline */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Analysis Summary Box */}
          {issue.ai_analysis && (
            <div className="bg-gradient-to-br from-indigo-900 via-brand-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-800/50 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">AI Triage Insights</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                  Confidence {(issue.ai_analysis.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-indigo-800/40">
                  <span className="text-indigo-200">Calculated Score</span>
                  <span className="font-bold font-mono text-emerald-300">{issue.ai_analysis.calculated_priority_score?.toFixed(1)} / 100</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-indigo-800/40">
                  <span className="text-indigo-200">Suggested Dept</span>
                  <span className="font-medium text-slate-100 truncate max-w-[180px]">{issue.ai_analysis.recommended_department}</span>
                </div>
              </div>

              {issue.ai_analysis.risk_factors && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block mb-1">Risk Factors Evaluated</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-indigo-800/30">
                    {issue.ai_analysis.risk_factors}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Duplicate Candidates Warning (if any) */}
          {duplicates.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Possible Duplicate Reports ({duplicates.length})</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                TF-IDF similarity identified existing complaints in this vicinity:
              </p>
              <div className="space-y-1.5 pt-1">
                {duplicates.map(d => (
                  <Link
                    key={d.id}
                    to={`/issues/${d.id}`}
                    className="block p-2 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 text-xs hover:border-amber-400"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold font-mono text-[10px] text-indigo-600">{d.report_id}</span>
                      <span className="text-[10px] font-semibold text-slate-500">{(d.similarity_score * 100).toFixed(0)}% Match</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">{d.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Grievance Lifecycle Timeline</span>
            </h3>
            <StatusTimeline timeline={issue.timeline} />
          </div>

        </div>

      </div>

    </div>
  );
}

