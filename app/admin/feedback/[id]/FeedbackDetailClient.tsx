"use client";

import { ArrowLeft, Bug, Lightbulb, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FeedbackData {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  adminResponse: string | null;
  internalNotes: string | null;
  respondedAt: Date | null;
  tags: string[] | null;
  createdAt: Date;
  submitter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    clerkUserId: string;
  } | null;
  responder: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

interface FeedbackDetailClientProps {
  feedbackId: string;
  canRespond: boolean;
  canManage: boolean;
}

export default function FeedbackDetailClient({ feedbackId, canRespond, canManage }: FeedbackDetailClientProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, [feedbackId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`);
      if (!response.ok) throw new Error("Failed to fetch feedback");

      const data = (await response.json()) as { feedback: FeedbackData };
      setFeedback(data.feedback);

      // Set form defaults
      setStatus(data.feedback.status);
      setPriority(data.feedback.priority || "");
      setAdminResponse(data.feedback.adminResponse || "");
      setInternalNotes(data.feedback.internalNotes || "");
      setTags(data.feedback.tags || []);
    } catch (error) {
      toast.error("Failed to load feedback");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canRespond) {
      toast.error("You don't have permission to respond to feedback");
      return;
    }

    if (!adminResponse.trim() && status === feedback?.status) {
      toast.error("Please provide a response or change the status");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Sending response...");

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(canManage && priority && { priority }),
          ...(adminResponse.trim() && { adminResponse: adminResponse.trim() }),
          ...(canManage && internalNotes.trim() && { internalNotes: internalNotes.trim() }),
          ...(canManage && tags.length > 0 && { tags }),
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to respond to feedback");
      }

      toast.success("Response sent successfully!", { id: toastId });
      router.refresh();
      fetchFeedback();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send response", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug_report":
        return { icon: Bug, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/20", label: "Bug Report" };
      case "feature_request":
        return { icon: Lightbulb, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/20", label: "Feature Request" };
      case "general_feedback":
        return { icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/20", label: "General Feedback" };
      default:
        return { icon: MessageSquare, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/20", label: "Other" };
    }
  };

  if (loading || !feedback) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryIcon(feedback.category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/feedback"
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feedback Details</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Review and respond to user feedback</p>
        </div>
      </div>

      {/* Feedback Information */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-6 flex items-start gap-4">
          <div className={`rounded-lg p-3 ${categoryInfo.bgColor}`}>
            <CategoryIcon className={`h-8 w-8 ${categoryInfo.color}`} />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{feedback.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {categoryInfo.label}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Submitted {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Submitter Info */}
        <div className="mb-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Submitted By</h3>
          {feedback.submitter ? (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {feedback.submitter.firstName} {feedback.submitter.lastName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{feedback.submitter.email}</div>
              <Link
                href={`/admin/users/${feedback.submitter.clerkUserId}`}
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500"
              >
                View User Profile →
              </Link>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Unknown user</span>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</h3>
          <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">{feedback.description}</p>
        </div>

        {/* Current Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {feedback.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Previous Response */}
      {feedback.adminResponse && (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Previous Response</h3>
          <div className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="mb-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{feedback.adminResponse}</p>
            {feedback.responder && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By {feedback.responder.firstName} {feedback.responder.lastName}
                {feedback.respondedAt && ` • ${new Date(feedback.respondedAt).toLocaleDateString()}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Response Form */}
      {canRespond && (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {feedback.adminResponse ? "Update Response" : "Send Response"}
          </h3>

          {/* Status & Priority */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {canManage && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            )}
          </div>

          {/* Admin Response */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin Response (visible to user)
            </label>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Explain the status update and any next steps..."
              maxLength={2000}
            />
            <div className="mt-1 text-right text-sm text-gray-500 dark:text-gray-400">
              {adminResponse.length}/2000
            </div>
          </div>

          {/* Internal Notes */}
          {canManage && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Internal Notes (admin only, not visible to user)
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Private notes for internal reference..."
                maxLength={5000}
              />
              <div className="mt-1 text-right text-sm text-gray-500 dark:text-gray-400">
                {internalNotes.length}/5000
              </div>
            </div>
          )}

          {/* Tags */}
          {canManage && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Sending..." : "Send Response"}
          </button>
        </form>
      )}
    </div>
  );
}
