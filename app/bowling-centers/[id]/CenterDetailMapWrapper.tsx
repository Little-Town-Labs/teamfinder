"use client";

import dynamic from "next/dynamic";

// Dynamically import CenterDetailMap to avoid SSR issues with Mapbox
const CenterDetailMap = dynamic(() => import("./CenterDetailMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-sm text-gray-600 dark:text-gray-400">Loading map...</div>
    </div>
  ),
});

interface CenterDetailMapWrapperProps {
  latitude: string;
  longitude: string;
  verified: boolean;
}

export default function CenterDetailMapWrapper({ latitude, longitude, verified }: CenterDetailMapWrapperProps) {
  return <CenterDetailMap latitude={latitude} longitude={longitude} verified={verified} />;
}
