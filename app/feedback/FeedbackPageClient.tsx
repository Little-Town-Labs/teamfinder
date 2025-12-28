"use client";

import { Bug, Lightbulb, MessageSquare, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import FeedbackList from "./FeedbackList";
import FeedbackSubmissionModal from "./FeedbackSubmissionModal";

interface FeedbackItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  adminResponse: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function FeedbackPageClient() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [filteredList, setFilteredList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedback");
      if (!response.ok) throw new Error("Failed to fetch feedback");

      const data = (await response.json()) as { feedback: FeedbackItem[] };
      setFeedbackList(data.feedback);
      setFilteredList(data.feedback);
    } catch (error) {
      toast.error("Failed to load feedback");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = feedbackList;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((f) => f.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    setFilteredList(filtered);
  }, [categoryFilter, statusFilter, feedbackList]);

  const handleSubmitSuccess = () => {
    setShowModal(false);
    toast.success("Feedback submitted successfully!");
    fetchFeedback();
  };

  const categoryStats = {
    bug_report: feedbackList.filter((f) => f.category === "bug_report").length,
    feature_request: feedbackList.filter((f) => f.category === "feature_request").length,
    general_feedback: feedbackList.filter((f) => f.category === "general_feedback").length,
    other: feedbackList.filter((f) => f.category === "other").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-extrabold text-transparent dark:from-white dark:to-gray-300">
                Your Feedback
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Help us improve TeamFinder by sharing your ideas and reporting issues
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 dark:from-blue-600 dark:to-blue-700 dark:shadow-blue-500/20"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              Submit Feedback
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-red-950/20 dark:to-red-900/10">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-red-500/10 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative flex items-center gap-4">
              <div className="rounded-xl bg-red-500/10 p-3 ring-1 ring-red-500/20">
                <Bug className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {categoryStats.bug_report}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Bug Reports</div>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-yellow-950/20 dark:to-yellow-900/10">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-yellow-500/10 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative flex items-center gap-4">
              <div className="rounded-xl bg-yellow-500/10 p-3 ring-1 ring-yellow-500/20">
                <Lightbulb className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {categoryStats.feature_request}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Feature Requests</div>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-blue-950/20 dark:to-blue-900/10">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3 ring-1 ring-blue-500/20">
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {categoryStats.general_feedback + categoryStats.other}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">General Feedback</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 rounded-xl bg-white/80 p-6 shadow-md backdrop-blur-sm dark:bg-gray-800/80">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <FeedbackList feedbackList={filteredList} loading={loading} onRefresh={fetchFeedback} />
      </div>

      {/* Submission Modal */}
      {showModal && (
        <FeedbackSubmissionModal onClose={() => setShowModal(false)} onSuccess={handleSubmitSuccess} />
      )}
    </div>
  );
}
