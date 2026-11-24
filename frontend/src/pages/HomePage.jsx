import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import IssueCard from '../components/IssueCard';
import {
  ShieldAlert, Sparkles, PlusCircle, ArrowRight, CheckCircle2,
  AlertTriangle, Wrench, FileSearch, Send, Cpu, MapPin,
  TrendingUp, Users, Award, ChevronRight, HelpCircle,
  Lightbulb, Building2, GraduationCap, RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Roads & Potholes', icon: '🛣️', desc: 'Potholes, broken asphalt & dividers' },
  { name: 'Water & Drainage', icon: '💧', desc: 'Pipe bursts, sewage leaks & waterlogging' },
  { name: 'Waste Management', icon: '🗑️', desc: 'Overflowing bins & roadside garbage dumps' },
  { name: 'Electricity & Streetlights', icon: '💡', desc: 'Dark lanes, broken lights & live wires' },
  { name: 'Public Safety', icon: '⚠️', desc: 'Open manholes, hazardous structures' },
  { name: 'Public Transport', icon: '🚌', desc: 'Bus stop damage, missing signboards' },
  { name: 'Environment', icon: '🌳', desc: 'Fallen trees, illegal burning & pollution' },
  { name: 'Healthcare', icon: '🏥', desc: 'Mosquito breeding, clinic accessibility' },
  { name: 'Education', icon: '🏫', desc: 'School approach roads & perimeter safety' },
  { name: 'Other Civic Issues', icon: '📋', desc: 'Parks, pavements & community facilities' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [issuesData, analyticsData] = await Promise.all([
        api.getProblems({ limit: 6, sort_by: 'newest' }),
        api.getGovernmentAnalytics()
      ]);
      setIssues(issuesData);
      setStats(analyticsData.metrics);
    } catch (err) {
      console.error("Failed to load homepage data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    try {
      await api.voteProblem(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const faqs = [
    {
      q: "How does CivicSolve AI prioritize civic complaints?",
      a: "Our modular AI engine evaluates complaint severity, public safety risk factors (e.g. live wires, cave-ins, open manholes), pedestrian impact, and citizen-flagged urgency to compute a transparent score from 0 to 100, mapping directly to Low, Medium, High, or Critical priority."
    },
    {
      q: "Can ordinary complaints be marked resolved by student projects?",
      a: "No. Ordinary civic complaints must strictly follow the official municipal authority workflow (Verified by Admin -> Assigned to Officer -> In Progress -> Resolved with evidence). University and student innovation projects operate in a distinct Solution Hub and never automatically resolve public complaints."
    },
    {
      q: "How does duplicate detection prevent redundant work?",
      a: "When a citizen reports an issue, scikit-learn TF-IDF vectorization and cosine similarity analyze the description against existing complaints. If a high semantic similarity or close geographic proximity is detected, the report flags candidate duplicates for administrative review."
    },
    {
      q: "What role can universities and student teams play?",
      a: "Students and universities explore approved societal challenges in the Solution Hub, submit engineering proposals, track milestone roadmaps, receive faculty mentor reviews, and collaborate with industry partners for pilot deployments."
    }
  ];

  return (
    <div className="space-y-10 lg:space-y-14 pb-16">
      
      {/* HERO SECTION WITH REALISTIC CIVIC BACKGROUND */}
      <section className="relative overflow-hidden -mt-16 sm:-mt-20 pt-24 sm:pt-28 lg:pt-36 pb-10 lg:pb-16 border-b border-slate-200 dark:border-slate-800">
        
        {/* Background Image Container with Premium Readability Overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/hero-civic.jpg"
            alt="Indian Urban Road Infrastructure, Potholes & Municipal Grievances"
            className="w-full h-full object-cover object-bottom"
          />
          {/* Frosted Multi-Layer Backdrop Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/60 dark:from-slate-950/95 dark:via-slate-950/90 dark:to-slate-950/75 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-white/30 dark:from-slate-950 dark:via-transparent dark:to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left bg-white/70 dark:bg-slate-950/70 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 lg:p-0 rounded-2xl border border-white/60 dark:border-slate-800/60 lg:border-none shadow-sm lg:shadow-none">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>AI-Powered Civic Innovation Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                <span className="block">Together,</span>
                <span className="block mt-2 sm:mt-3.5 bg-gradient-to-r from-brand-600 via-indigo-500 to-civic-teal bg-clip-text text-transparent">
                  Let's Build a Better Tomorrow.
                </span>
              </h1>

              <p className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                Report Problems. Inspire Solutions. Transform Communities.
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                CivicSolve AI empowers citizens, students, and communities to identify civic challenges and turn innovative ideas into real-world solutions.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report a Problem</span>
                </Link>

                <Link
                  to="/issues"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <span>Explore Live Issues</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/solutions"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-100 transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Discover Solutions</span>
                </Link>
              </div>

              {/* Trust Badge / Seed Tag */}
              <div className="pt-2 flex items-center justify-center lg:justify-start space-x-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Database-Backed Workflows</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Smart India Hackathon Ready</span>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-700 p-1 shadow-2xl shadow-indigo-500/20">
                <div className="bg-slate-900 rounded-[14px] p-5 text-white space-y-4">
                  
                  {/* Top card banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-mono text-slate-400 ml-2">AI Civic Engine Live</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      Smart Triage
                    </span>
                  </div>

                  {/* Sample AI triage simulation */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Incoming Grievance</span>
                        <span className="text-emerald-400 font-mono text-[11px]">CS-2026-0001</span>
                      </div>
                      <p className="text-sm font-semibold text-white">Severe Pothole Cluster on MG Road Junction</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          CRITICAL • 88.5/100
                        </span>
                        <span className="text-[10px] text-slate-400">Auto-detected: 2-Wheeler Hazard</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Assigned Wing</span>
                        <span className="font-semibold text-indigo-300 text-[11px]">DPW Roads Dept</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                        <span className="text-[10px] text-slate-400 block">SLA Target</span>
                        <span className="font-semibold text-emerald-300 text-[11px]">24h Dispatch</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-200 text-[11px]">NLP Duplicate Detector: 0 matches</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">100% Unique</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-[11px] text-slate-400">
                    Real-time verification queue connected to municipal field inspectors.
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST AND IMPACT METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Platform Activity</h2>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">Live Municipal Redressal Metrics</p>
          <div className="mt-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Database Seed: Demo Data Included
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.total_reports || 6}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Total Reports</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats?.verified || 2}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Verified Issues</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.in_progress || 1}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">In Progress</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats?.resolved || 1}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Resolved Issues</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center col-span-2 md:col-span-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">2</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Innovation Projects</p>
          </div>
        </div>
      </section>

      {/* PROBLEM CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Civic Focus Areas</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Report Across 10 Key Sectors</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Each category is routed directly to the specialized municipal department.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/issues?category=${encodeURIComponent(cat.name)}`}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-2 block">{cat.icon}</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {cat.desc}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center space-x-1">
                <span>View Reports</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST CIVIC ISSUES WITH WORKING FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Real-Time Grievances</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">Latest Community Reports</p>
          <div className="mt-2">
            <Link
              to="/issues"
              className="inline-flex items-center space-x-1 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>Explore All Issues</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">No civic issues found matching criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
            ))}
          </div>
        )}
      </section>


      {/* INNOVATION HUB SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-brand-200">
              Smart India Hackathon & University Cell
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ideas That Create Real Impact
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Bring students, universities, faculty mentors, and industry partners together to design, test, and evaluate solutions to real societal challenges.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/solutions"
                className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-colors shadow-md"
              >
                Explore the Solution Hub &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Frequently Asked Questions</h2>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Platform Guidance & Policies</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

