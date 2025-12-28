"use client";

import { Bug, CheckCircle2, Clock, Lightbulb, MessageSquare, XCircle } from "lucide-react";
import { useState } from "react";

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

interface FeedbackListProps {
  feedbackList: FeedbackItem[];
  loading: boolean;
  onRefresh: () => void;
}

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
      return { label: "Submitted", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
    case "under_review":
      return { label: "Under Review", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" };
    case "planned":
      return { label: "Planned", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" };
    case "in_progress":
      return { label: "In Progress", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
    case "completed":
      return { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
    case "declined":
      return { label: "Declined", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
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
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function FeedbackList({ feedbackList, loading, onRefresh }: FeedbackListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="mb-2 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
              <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
        <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No feedback yet</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          You haven&apos;t submitted any feedback. Share your ideas to help us improve!
        </p>
        <button
          onClick={onRefresh}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackList.map((item) => {
        const categoryInfo = getCategoryIcon(item.category);
        const CategoryIcon = categoryInfo.icon;
        const statusBadge = getStatusBadge(item.status);
        const priorityBadge = item.priority ? getPriorityBadge(item.priority) : null;
        const isExpanded = expandedId === item.id;

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-md dark:bg-gray-800"
          >
            {/* Card Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full p-6 text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className={`rounded-lg p-2.5 ${categoryInfo.bgColor}`}>
                    <CategoryIcon className={`h-6 w-6 ${categoryInfo.color}`} />
                  </div>

                  {/* Title & Category */}
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-600">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {getRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Priority Badges */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  {priorityBadge && (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityBadge.color}`}>
                      {priorityBadge.label}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
                {/* Description */}
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</h4>
                  <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>

                {/* Admin Response */}
                {item.adminResponse && (
                  <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 dark:bg-gray-800">
                    <div className="mb-2 flex items-center gap-2">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : item.status === "declined" ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Admin Response</h4>
                    </div>
                    <p className="mb-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {item.adminResponse}
                    </p>
                    {item.respondedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Responded {getRelativeTime(item.respondedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
