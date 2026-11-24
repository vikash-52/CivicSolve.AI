import React from 'react';
import {
  ShieldAlert, Sparkles, CheckCircle2, Lock, Cpu,
  GraduationCap, Building2, Users, FileText, Heart
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Mission & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          About CivicSolve AI
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          An AI-powered civic problem reporting, tracking, and collaborative societal innovation platform designed for Smart India Hackathon and public governance.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Citizen-Authority Pipeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Directly routes everyday grievances (potholes, water leaks, unlit streetlights) to verified municipal field inspectors through strict RBAC enforcement.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Explainable AI Triage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Calculates 0-100 priority scores based on hazard keywords and pedestrian risk, detects duplicate reports via TF-IDF cosine similarity, and routes to departments.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">University Innovation Hub</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Separate research track for engineering student teams and faculty mentors to tackle long-term urban challenges without bypassing municipal accountability.
          </p>
        </div>
      </div>

      {/* Security & RBAC Policy Section */}
      <div id="security" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-600" />
          <span>Security & Role-Based Access Control (RBAC)</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          CivicSolve AI strictly adheres to the principle of least privilege. In accordance with system security rules:
        </p>
        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
          <li><strong>Zero Self-Privilege Escalation:</strong> Public registration forms can never assign <code>SYSTEM_ADMIN</code>, <code>AUTHORITY_OFFICER</code>, or <code>GOVERNMENT_OFFICIAL</code> roles. Any attempt is automatically clamped by the FastAPI backend to <code>CITIZEN</code>.</li>
          <li><strong>Cryptographic Password Hashing:</strong> Passwords are hashed with salt using <code>bcrypt</code> and never stored in plaintext.</li>
          <li><strong>Immutable Status History:</strong> Every transition from <code>REPORTED</code> to <code>RESOLVED</code> records an audited timeline entry with officer credentials and resolution evidence.</li>
        </ul>
      </div>

      {/* Privacy Policy */}
      <div id="privacy" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-civic-teal" />
          <span>Privacy & Citizen Data Safeguards</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Citizens' contact phone numbers and personal emails are never published on the public issue feed. Public cards display only anonymized community grievance summaries, photos, and approximate landmarks to preserve privacy while enabling municipal resolution.
        </p>
      </div>

    </div>
  );
}

