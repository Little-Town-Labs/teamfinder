"use client";

import { useState } from "react";

import ShareButton from "./ShareButton";
import SuggestEditModal from "./SuggestEditModal";

interface CenterDetailClientProps {
  center: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    numberOfLanes: string | null;
    amenities: string[] | null;
    verified: boolean;
  };
}

export default function CenterDetailClient({ center }: CenterDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ShareButton centerId={center.id} centerName={center.name} />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Suggest Edit
        </button>
      </div>

      <SuggestEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} center={center} />
    </>
  );
}
