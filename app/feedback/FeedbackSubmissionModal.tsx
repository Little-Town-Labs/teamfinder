"use client";

import { Bug, Lightbulb, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface FeedbackSubmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "bug_report", label: "Bug Report", icon: Bug, color: "text-red-600" },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb, color: "text-yellow-600" },
  { value: "general_feedback", label: "General Feedback", icon: MessageSquare, color: "text-blue-600" },
  { value: "other", label: "Other", icon: MessageSquare, color: "text-gray-600" },
] as const;

export default function FeedbackSubmissionModal({ onClose, onSuccess }: FeedbackSubmissionModalProps) {
  const [category, setCategory] = useState<string>("general_feedback");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (description.length > 5000) {
      newErrors.description = "Description must be less than 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting feedback...");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, description }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully!", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === category) || CATEGORIES[2];
  const CategoryIcon = selectedCategory.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Feedback</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Category Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      category === cat.value
                        ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${category === cat.value ? "text-blue-600 dark:text-blue-500" : cat.color}`} />
                    <span className={`text-xs font-medium ${category === cat.value ? "text-blue-600 dark:text-blue-500" : "text-gray-700 dark:text-gray-300"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CategoryIcon className={`absolute left-3 top-3 h-5 w-5 ${selectedCategory.color}`} />
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="Brief summary of your feedback"
                className={`w-full rounded-lg border py-2 pl-10 pr-4 text-gray-900 dark:bg-gray-700 dark:text-white ${
                  errors.title
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
                }`}
                maxLength={100}
                disabled={submitting}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              {errors.title ? (
                <p className="text-sm text-red-500">{errors.title}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Minimum 5 characters</p>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">{title.length}/100</span>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Please provide as much detail as possible..."
              rows={8}
              className={`w-full rounded-lg border p-4 text-gray-900 dark:bg-gray-700 dark:text-white ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
              }`}
              maxLength={5000}
              disabled={submitting}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-sm text-red-500">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Minimum 20 characters</p>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">{description.length}/5000</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
