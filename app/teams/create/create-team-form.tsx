"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateTeamFormProps {
  userId: string;
}

export default function CreateTeamForm({ userId }: CreateTeamFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    teamType: "",
    genderType: "",
    competitionLevel: "",
    description: "",
    lookingForPlayers: true,
    openPositions: "",
    minAverage: "",
    maxAverage: "",
    additionalNotes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error: string };
        throw new Error(data.error || "Failed to create team");
      }

      const data = (await response.json()) as { teamId: string };
      router.push(`/teams/${data.teamId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Team Information</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Team Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Team Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Strike Force"
        />
      </div>

      {/* Team Type */}
      <div>
        <label htmlFor="teamType" className="block text-sm font-medium text-gray-700">
          Team Type <span className="text-red-500">*</span>
        </label>
        <select
          id="teamType"
          name="teamType"
          required
          value={formData.teamType}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select team type</option>
          <option value="singles">Singles</option>
          <option value="doubles">Doubles</option>
          <option value="team">Team (3-5 players)</option>
        </select>
      </div>

      {/* Gender Type */}
      <div>
        <label htmlFor="genderType" className="block text-sm font-medium text-gray-700">
          Gender Type <span className="text-red-500">*</span>
        </label>
        <select
          id="genderType"
          name="genderType"
          required
          value={formData.genderType}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select gender type</option>
          <option value="male">Men's Team</option>
          <option value="female">Women's Team</option>
          <option value="other">Mixed Team</option>
        </select>
      </div>

      {/* Competition Level */}
      <div>
        <label htmlFor="competitionLevel" className="block text-sm font-medium text-gray-700">
          Competition Level <span className="text-red-500">*</span>
        </label>
        <select
          id="competitionLevel"
          name="competitionLevel"
          required
          value={formData.competitionLevel}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select competition level</option>
          <option value="recreational">Recreational</option>
          <option value="league">League</option>
          <option value="competitive">Competitive</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Team Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Tell others about your team, your goals, and what you're looking for in teammates..."
        />
      </div>

      {/* Looking for Players */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="lookingForPlayers"
            checked={formData.lookingForPlayers}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">We're currently looking for players</span>
        </label>
      </div>

      {/* Recruitment Requirements (only show if looking for players) */}
      {formData.lookingForPlayers && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recruitment Requirements</h3>

          <div>
            <label htmlFor="openPositions" className="block text-sm font-medium text-gray-700">
              Number of Open Positions
            </label>
            <input
              type="number"
              id="openPositions"
              name="openPositions"
              min="1"
              max="5"
              value={formData.openPositions}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minAverage" className="block text-sm font-medium text-gray-700">
                Minimum Average (optional)
              </label>
              <input
                type="number"
                id="minAverage"
                name="minAverage"
                min="0"
                max="300"
                value={formData.minAverage}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 150"
              />
            </div>

            <div>
              <label htmlFor="maxAverage" className="block text-sm font-medium text-gray-700">
                Maximum Average (optional)
              </label>
              <input
                type="number"
                id="maxAverage"
                name="maxAverage"
                min="0"
                max="300"
                value={formData.maxAverage}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
              Additional Requirements
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={3}
              value={formData.additionalNotes}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any other requirements or preferences for potential team members..."
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating Team..." : "Create Team"}
        </button>
      </div>
    </form>
  );
}
