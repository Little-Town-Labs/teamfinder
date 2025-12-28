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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Feedback</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Help us improve TeamFinder by sharing your ideas and reporting issues
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Plus className="h-5 w-5" />
              Submit Feedback
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Bug className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryStats.bug_report}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bug Reports</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryStats.feature_request}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Feature Requests</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryStats.general_feedback + categoryStats.other}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">General Feedback</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="bug_report">Bug Reports</option>
              <option value="feature_request">Feature Requests</option>
              <option value="general_feedback">General Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
