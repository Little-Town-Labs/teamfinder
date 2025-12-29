"use client";

import { toast } from "sonner";

import type { CenterFilters as CenterFiltersType } from "./BrowseCentersClient";

interface CenterFiltersProps {
  filters: CenterFiltersType;
  setFilters: (filters: CenterFiltersType) => void;
}

export default function CenterFilters({ filters, setFilters }: CenterFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, state: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, city: e.target.value });
  };

  const handleVerifiedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, verified: e.target.checked ? true : null });
  };

  const handleUseLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const useLocation = e.target.checked;

    if (useLocation) {
      // Request geolocation
      if ("geolocation" in navigator) {
        toast.loading("Getting your location...", { id: "geolocation" });
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFilters({
              ...filters,
              useLocation: true,
              userLat: position.coords.latitude,
              userLng: position.coords.longitude,
              radius: filters.radius || 25, // Default to 25 miles
            });
            toast.success("Location enabled - showing centers near you", { id: "geolocation" });
          },
          (error) => {
            console.error("Geolocation error:", error);
            let errorMessage = "Failed to get location. Please enable location services.";

            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = "Location permission denied. Please enable location access in your browser.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMessage = "Location information unavailable. Please try again.";
            } else if (error.code === error.TIMEOUT) {
              errorMessage = "Location request timed out. Please try again.";
            }

            toast.error(errorMessage, { id: "geolocation" });
            setFilters({ ...filters, useLocation: false });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      } else {
        toast.error("Geolocation is not supported by your browser");
      }
    } else {
      setFilters({
        ...filters,
        useLocation: false,
        userLat: null,
        userLng: null,
        radius: null,
      });
      toast.info("Location search disabled");
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, radius: parseInt(e.target.value) });
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      state: "",
      city: "",
      verified: null,
      useLocation: false,
      radius: null,
      userLat: null,
      userLng: null,
    });
  };

  const hasActiveFilters =
    filters.search || filters.state || filters.city || filters.verified || filters.useLocation;

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg dark:from-gray-900 dark:to-gray-800/50">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Filter Centers</h2>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by name, city, or address..."
            className="mt-1 block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
          />
        </div>

        {/* State and City */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="state" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              State
            </label>
            <input
              type="text"
              id="state"
              value={filters.state}
              onChange={handleStateChange}
              placeholder="e.g., CA, TX, NY"
              className="mt-1 block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              City
            </label>
            <input
              type="text"
              id="city"
              value={filters.city}
              onChange={handleCityChange}
              placeholder="e.g., Los Angeles"
              className="mt-1 block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Verified Only */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="verified"
            checked={filters.verified || false}
            onChange={handleVerifiedChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="verified" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show verified centers only
          </label>
        </div>

        {/* Proximity Search */}
        <div className="space-y-2 border-t pt-4 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Proximity Search</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useLocation"
              checked={filters.useLocation}
              onChange={handleUseLocationChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="useLocation" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Use my location
            </label>
          </div>

          {filters.useLocation && filters.userLat && filters.userLng && (
            <div className="space-y-2">
              <div className="rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <svg
                    className="mr-1 inline h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Showing centers near your location
                </p>
              </div>
              <div>
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Within radius
                </label>
                <select
                  id="radius"
                  value={filters.radius || 25}
                  onChange={handleRadiusChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value={10}>10 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100 miles</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
