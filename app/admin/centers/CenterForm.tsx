"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CenterFormProps {
  mode: "create" | "edit";
  adminClerkUserId: string;
  initialData?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string | null;
    website: string | null;
    laneCount: number | null;
    isVerified: boolean;
  };
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export function CenterForm({ mode, adminClerkUserId: _adminClerkUserId, initialData }: CenterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    phoneNumber: initialData?.phoneNumber || "",
    website: initialData?.website || "",
    laneCount: initialData?.laneCount?.toString() || "",
    isVerified: initialData?.isVerified || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/admin/centers"
          : `/api/admin/centers/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phoneNumber: formData.phoneNumber || null,
          website: formData.website || null,
          laneCount: formData.laneCount ? parseInt(formData.laneCount, 10) : null,
          isVerified: formData.isVerified,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || `Failed to ${mode} center`);
      }

      router.push("/admin/centers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Center Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Center Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select state...</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            pattern="[0-9]{5}"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Website */}
      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Website
        </label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Lane Count */}
      <div>
        <label
          htmlFor="laneCount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Number of Lanes
        </label>
        <input
          type="number"
          id="laneCount"
          value={formData.laneCount}
          onChange={(e) => setFormData({ ...formData, laneCount: e.target.value })}
          min="1"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Is Verified */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isVerified"
          checked={formData.isVerified}
          onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="isVerified" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Mark as verified
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Center" : "Update Center"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/centers")}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
