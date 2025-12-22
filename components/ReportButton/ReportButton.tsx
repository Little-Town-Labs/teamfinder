"use client";

import { Flag } from "lucide-react";
import { useState } from "react";

import { ReportModal } from "./ReportModal";

interface ReportButtonProps {
  reportType: "user" | "team" | "message" | "bowling_center";
  targetId: string;
  targetDescription: string;
  className?: string;
}

export function ReportButton({
  reportType,
  targetId,
  targetDescription,
  className = "",
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
      >
        <Flag className="h-4 w-4" />
        Report
      </button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportType={reportType}
        targetId={targetId}
        targetDescription={targetDescription}
      />
    </>
  );
}
