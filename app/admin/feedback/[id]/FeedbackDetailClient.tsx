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
          <div className="mb-4 h-8 w-1/3 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
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
          className="group rounded-xl bg-white p-2.5 shadow-md transition-all hover:scale-105 hover:shadow-lg dark:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 transition-transform group-hover:-translate-x-1 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-extrabold text-transparent dark:from-white dark:to-gray-300">
            Feedback Details
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">Review and respond to user feedback</p>
        </div>
      </div>

      {/* Feedback Information */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg dark:from-gray-800 dark:to-gray-900/50">
        <div className="mb-6 flex items-start gap-4">
          <div className={`rounded-xl p-3 shadow-sm ${categoryInfo.bgColor}`}>
            <CategoryIcon className={`h-8 w-8 ${categoryInfo.color}`} />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{feedback.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gradient-to-r from-gray-100 to-gray-200/50 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm dark:from-gray-700 dark:to-gray-600/50 dark:text-gray-300">
                {categoryInfo.label}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Submitted {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Submitter Info */}
        <div className="mb-6 rounded-xl border-2 border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-sm dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/30">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Submitted By</h3>
          {feedback.submitter ? (
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {feedback.submitter.firstName} {feedback.submitter.lastName}
              </div>
              <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{feedback.submitter.email}</div>
              <Link
                href={`/admin/users/${feedback.submitter.clerkUserId}`}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/30"
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
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Description</h3>
          <div className="rounded-xl bg-white/80 p-4 shadow-sm dark:bg-gray-800/80">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">{feedback.description}</p>
          </div>
        </div>

        {/* Current Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {feedback.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gradient-to-r from-blue-100 to-blue-200/50 px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400"
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
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg dark:from-gray-800 dark:to-gray-900/50">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Previous Response</h3>
          <div className="rounded-xl border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/30 p-5 shadow-md dark:from-blue-950/30 dark:to-blue-900/10">
            <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-200">{feedback.adminResponse}</p>
            {feedback.responder && (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                By {feedback.responder.firstName} {feedback.responder.lastName}
                {feedback.respondedAt && ` • ${new Date(feedback.respondedAt).toLocaleDateString()}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Response Form */}
      {canRespond && (
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg dark:from-gray-800 dark:to-gray-900/50">
          <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
            {feedback.adminResponse ? "Update Response" : "Send Response"}
          </h3>

          {/* Status & Priority */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
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
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
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
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Admin Response (visible to user)
            </label>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={6}
              className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
              placeholder="Explain the status update and any next steps..."
              maxLength={2000}
            />
            <div className="mt-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
              {adminResponse.length}/2000
            </div>
          </div>

          {/* Internal Notes */}
          {canManage && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Internal Notes (admin only, not visible to user)
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                placeholder="Private notes for internal reference..."
                maxLength={5000}
              />
              <div className="mt-2 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                {internalNotes.length}/5000
              </div>
            </div>
          )}

          {/* Tags */}
          {canManage && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:scale-105 hover:from-gray-300 hover:to-gray-400 hover:shadow-md dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200/50 px-3 py-1.5 text-sm font-semibold text-blue-800 shadow-sm dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="transition-transform hover:scale-125 hover:text-blue-900 dark:hover:text-blue-300"
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
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-blue-600 dark:to-blue-700"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                Send Response
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
