"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  centerId: string;
  centerName: string;
}

export default function ShareButton({ centerId, centerName }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);

    const url = `${window.location.origin}/bowling-centers/${centerId}`;
    const title = `Check out ${centerName}`;
    const text = `${centerName} - Find teams, leagues, and players at this bowling center`;

    // Try Web Share API first (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled or error occurred
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error sharing:", err);
          fallbackCopyToClipboard(url);
        }
      }
    } else {
      // Fallback to clipboard
      fallbackCopyToClipboard(url);
    }

    setIsSharing(false);
  };

  const fallbackCopyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      title="Share this center"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      Share
    </button>
  );
}
