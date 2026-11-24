import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LeafletCivicMap from '../components/LeafletCivicMap';
import {
  BarChart2, TrendingUp, AlertTriangle, CheckCircle2,
  Building2, MapPin, RefreshCw, Layers, ShieldAlert,
  Clock, PieChart
} from 'lucide-react';

export default function ImpactAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, pointsData] = await Promise.all([
        api.getGovernmentAnalytics(),
        api.getGovernmentMapPoints()
      ]);
      setAnalytics(analyticsData);
      setMapPoints(pointsData);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500">Querying live government metrics and spatial coordinates...</p>
      </div>
    );
  }

  const metrics = analytics?.metrics || {};
  const priorityDist = analytics?.priority_distribution || {};
  const categoryDist = analytics?.category_distribution || [];
  const deptWorkload = analytics?.department_workload || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Municipal Command Center & Impact
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Demo Data Included
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time database analytics, category breakdowns, departmental workload, and spatial GIS mapping.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Reports</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{metrics.total_reports || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">City-wide Grievances</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Pending Triage</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{metrics.pending_verification || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting Verification</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">In Progress</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{metrics.in_progress || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Field Teams Active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{metrics.resolved || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified Completed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Resolution Rate</span>
          <p className="text-3xl font-extrabold text-purple-600 mt-1">{metrics.resolution_rate_percent || 0}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Municipal Efficiency</span>
        </div>
      </div>

      {/* Interactive Leaflet Civic Map */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Interactive Geospatial Civic Map</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live coordinates of reported potholes, leaks, and streetlights plotted on OpenStreetMap.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {mapPoints.length} Pinned Locations
          </span>
        </div>

        <div className="h-96 w-full rounded-xl overflow-hidden">
          <LeafletCivicMap points={mapPoints} />
        </div>
      </div>

      {/* Middle Grid: Priority & Department Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>AI Priority Distribution</span>
          </h2>

          <div className="space-y-3 pt-2">
            {[
              { level: 'CRITICAL', count: priorityDist.CRITICAL || 0, color: 'bg-rose-500', text: 'text-rose-600' },
              { level: 'HIGH', count: priorityDist.HIGH || 0, color: 'bg-orange-500', text: 'text-orange-600' },
              { level: 'MEDIUM', count: priorityDist.MEDIUM || 0, color: 'bg-amber-500', text: 'text-amber-600' },
              { level: 'LOW', count: priorityDist.LOW || 0, color: 'bg-blue-500', text: 'text-blue-600' },
            ].map(p => {
              const total = metrics.total_reports || 1;
              const percent = Math.round((p.count / total) * 100);
              return (
                <div key={p.level} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{p.level} Priority</span>
                    <span className={p.text}>{p.count} issues ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Workload */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Departmental Workload & Resolution</span>
          </h2>

          <div className="space-y-3 pt-2 text-xs">
            {deptWorkload.map(d => (
              <div key={d.code} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{d.department}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {d.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Active Cases: <strong>{d.active_cases}</strong></span>
                  <span className="text-emerald-600 font-semibold">Resolved: {d.resolved_cases}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

