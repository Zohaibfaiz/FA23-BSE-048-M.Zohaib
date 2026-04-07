export const dynamic = 'force-dynamic';

import { BarChart3, DollarSign, TrendingUp, Users, FileText, Clock3, Rocket, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getOverviewStats, getAdminAnalyticsSummary } from '@/lib/dashboard';
import { formatCurrency } from '@/lib/utils';
import { AnalyticsCharts } from './analytics-charts';

export default async function AdminAnalyticsPage() {
  const [stats, summary] = await Promise.all([
    getOverviewStats(),
    getAdminAnalyticsSummary(),
  ]);

  return (
    <>
      <div className="page-title-bar">
        <h1>Analytics</h1>
        <p>Overview statistics, revenue charts, and marketplace insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="stat-card-grid mb-6">
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <Users className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{stats.totalUsers}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Total Ads</p>
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{stats.totalAds}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Pending Review</p>
            <Clock3 className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{stats.pendingAds}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Published</p>
            <Rocket className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{stats.publishedAds}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Archived</p>
            <Archive className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{stats.archivedAds}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Scheduled</p>
            <Clock3 className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{stats.scheduledAds}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Verified Revenue</p>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{formatCurrency(summary.verifiedRevenue)}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Approval Rate</p>
            <TrendingUp className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{(summary.approvalRate * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        revenueByPackage={summary.revenueByPackage}
        approvalRate={summary.approvalRate}
        rejectionRate={summary.rejectionRate}
        adsByCategory={summary.adsByCategory}
        adsByCity={summary.adsByCity}
      />
    </>
  );
}
