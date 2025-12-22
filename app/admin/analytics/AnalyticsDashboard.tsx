"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UserGrowthData {
  date: string;
  count: number;
}

interface TeamStats {
  totalTeams: number;
  activeTeams: number;
  lookingForPlayers: number;
  flaggedTeams: number;
}

interface ReportStats {
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
}

interface CenterStats {
  totalCenters: number;
  verifiedCenters: number;
  flaggedCenters: number;
}

interface ApiResponse<T> {
  data: T;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [centerStats, setCenterStats] = useState<CenterStats | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [userGrowthRes, teamStatsRes, reportStatsRes, centerStatsRes] = await Promise.all([
        fetch(`/api/admin/analytics/user-growth?days=${dateRange}`),
        fetch("/api/admin/analytics/team-stats"),
        fetch("/api/admin/analytics/report-stats"),
        fetch("/api/admin/analytics/center-stats"),
      ]);

      if (!userGrowthRes.ok || !teamStatsRes.ok || !reportStatsRes.ok || !centerStatsRes.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const [userGrowthData, teamStatsData, reportStatsData, centerStatsData] = (await Promise.all([
        userGrowthRes.json(),
        teamStatsRes.json(),
        reportStatsRes.json(),
        centerStatsRes.json(),
      ])) as [
        ApiResponse<UserGrowthData[]>,
        ApiResponse<TeamStats>,
        ApiResponse<ReportStats>,
        ApiResponse<CenterStats>,
      ];

      setUserGrowth(userGrowthData.data);
      setTeamStats(teamStatsData.data);
      setReportStats(reportStatsData.data);
      setCenterStats(centerStatsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/admin/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange: parseInt(dateRange, 10) }),
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  const reportChartData = reportStats
    ? [
        { name: "Pending", value: reportStats.pending },
        { name: "Investigating", value: reportStats.investigating },
        { name: "Resolved", value: reportStats.resolved },
        { name: "Dismissed", value: reportStats.dismissed },
      ]
    : [];

  const teamChartData = teamStats
    ? [
        { name: "Active Teams", value: teamStats.activeTeams },
        { name: "Recruiting", value: teamStats.lookingForPlayers },
        { name: "Flagged", value: teamStats.flaggedTeams },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teams</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {teamStats?.totalTeams || 0}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Centers</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {centerStats?.totalCenters || 0}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Pending Reports
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {reportStats?.pending || 0}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Verified Centers
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {centerStats?.verifiedCenters || 0}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Team Stats and Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Team Stats */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Team Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Report Stats */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Report Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
