"use client";

import { Bug, ChevronLeft, ChevronRight, Lightbulb, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FeedbackItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  createdAt: Date;
  submitter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

interface FeedbackListClientProps {
  initialStats: {
    submitted: number;
    under_review: number;
    planned: number;
    in_progress: number;
    completed: number;
    declined: number;
    total: number;
  };
}

const STATUS_TABS = [
  { value: "all", label: "All", key: "total" },
  { value: "submitted", label: "Submitted", key: "submitted" },
  { value: "under_review", label: "Under Review", key: "under_review" },
  { value: "planned", label: "Planned", key: "planned" },
  { value: "in_progress", label: "In Progress", key: "in_progress" },
  { value: "completed", label: "Completed", key: "completed" },
  { value: "declined", label: "Declined", key: "declined" },
] as const;

export default function FeedbackListClient({ initialStats }: FeedbackListClientProps) {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      params.append("page", currentPage.toString());

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch feedback");

      const data = (await response.json()) as {
        feedback: FeedbackItem[];
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      };

      setFeedbackList(data.feedback);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to load feedback");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, categoryFilter, priorityFilter, currentPage]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug_report":
        return { icon: Bug, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/20" };
      case "feature_request":
        return { icon: Lightbulb, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/20" };
      case "general_feedback":
        return { icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/20" };
      default:
        return { icon: MessageSquare, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/20" };
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "bug_report":
        return "Bug Report";
      case "feature_request":
        return "Feature Request";
      case "general_feedback":
        return "General Feedback";
      default:
        return "Other";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
      case "under_review":
        return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" };
      case "planned":
        return { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" };
      case "in_progress":
        return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
      case "completed":
        return { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
      case "declined":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return { label: "Critical", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
      case "high":
        return { label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" };
      case "medium":
        return { label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
      case "low":
        return { label: "Low", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
      default:
        return null;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-extrabold text-transparent dark:from-white dark:to-gray-300">
          Feedback Management
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">Review and respond to user feedback</p>
      </div>

      {/* Stats Tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-white/80 p-2 shadow-md backdrop-blur-sm dark:bg-gray-800/80">
        {STATUS_TABS.map((tab) => {
          const count = initialStats[tab.key as keyof typeof initialStats];
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label} <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${statusFilter === tab.value ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-white/80 p-6 shadow-md backdrop-blur-sm dark:bg-gray-800/80">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="bug_report">Bug Reports</option>
            <option value="feature_request">Feature Requests</option>
            <option value="general_feedback">General Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Feedback Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="h-6 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-16 text-center shadow-lg dark:from-gray-800 dark:to-gray-900/50">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <MessageSquare className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">No feedback found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 shadow-lg dark:from-gray-800 dark:to-gray-900/50">
          <table className="w-full">
            <thead className="border-b-2 border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:border-gray-700/50 dark:from-gray-900/50 dark:to-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Feedback
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Submitter
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {feedbackList.map((item) => {
                const categoryInfo = getCategoryIcon(item.category);
                const CategoryIcon = categoryInfo.icon;
                const statusBadge = getStatusBadge(item.status);
                const priorityBadge = item.priority ? getPriorityBadge(item.priority) : null;

                return (
                  <tr key={item.id} className="transition-colors hover:bg-white/80 dark:hover:bg-gray-800/80">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl p-2.5 shadow-sm ${categoryInfo.bgColor}`}>
                          <CategoryIcon className={`h-5 w-5 ${categoryInfo.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {getCategoryLabel(item.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.submitter ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.submitter.firstName} {item.submitter.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.submitter.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${statusBadge.color}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {priorityBadge ? (
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {getRelativeTime(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/feedback/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/30"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg bg-white px-6 py-4 shadow dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
