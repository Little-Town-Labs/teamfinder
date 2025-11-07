"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingFormProps {
  userId: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Critical Info
    usbcMemberId: "",
    gender: "",
    bowlingHand: "",

    // Step 2: Bowling Stats (optional)
    currentAverage: "",
    highGame: "",
    highSeries: "",
    yearsExperience: "",

    // Step 3: Preferences
    preferredTeamTypes: [] as string[],
    preferredCompetitionLevel: "",
    lookingForTeam: false,
    openToSubstitute: false,
    bio: "",
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

  const handleTeamTypeToggle = (teamType: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredTeamTypes: prev.preferredTeamTypes.includes(teamType)
        ? prev.preferredTeamTypes.filter((t) => t !== teamType)
        : [...prev.preferredTeamTypes, teamType],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create profile");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate step 1
    if (step === 1) {
      if (!formData.usbcMemberId || !formData.gender || !formData.bowlingHand) {
        setError("Please fill in all required fields");
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${step > s ? "bg-blue-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? "text-blue-600 font-medium" : "text-gray-500"}>
            Essential Info
          </span>
          <span className={step >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}>
            Bowling Stats
          </span>
          <span className={step >= 3 ? "text-blue-600 font-medium" : "text-gray-500"}>
            Preferences
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step 1: Essential Information */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Essential Information</h2>

          <div>
            <label htmlFor="usbcMemberId" className="block text-sm font-medium text-gray-700">
              USBC Member ID <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Your USBC Member ID is required for verification and credibility
            </p>
            <input
              type="text"
              id="usbcMemberId"
              name="usbcMemberId"
              required
              value={formData.usbcMemberId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 1234-56789"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              required
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="bowlingHand" className="block text-sm font-medium text-gray-700">
              Bowling Hand <span className="text-red-500">*</span>
            </label>
            <select
              id="bowlingHand"
              name="bowlingHand"
              required
              value={formData.bowlingHand}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select hand</option>
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Bowling Statistics */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Bowling Statistics</h2>
          <p className="text-sm text-gray-600">These fields are optional but help teams find you</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentAverage" className="block text-sm font-medium text-gray-700">
                Current Average
              </label>
              <input
                type="number"
                id="currentAverage"
                name="currentAverage"
                min="0"
                max="300"
                value={formData.currentAverage}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 180"
              />
            </div>

            <div>
              <label htmlFor="highGame" className="block text-sm font-medium text-gray-700">
                High Game
              </label>
              <input
                type="number"
                id="highGame"
                name="highGame"
                min="0"
                max="300"
                value={formData.highGame}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 279"
              />
            </div>

            <div>
              <label htmlFor="highSeries" className="block text-sm font-medium text-gray-700">
                High Series (3 games)
              </label>
              <input
                type="number"
                id="highSeries"
                name="highSeries"
                min="0"
                max="900"
                value={formData.highSeries}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 720"
              />
            </div>

            <div>
              <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsExperience"
                name="yearsExperience"
                min="0"
                value={formData.yearsExperience}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Team Preferences</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Team Types
            </label>
            <div className="space-y-2">
              {["singles", "doubles", "team"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferredTeamTypes.includes(type)}
                    onChange={() => handleTeamTypeToggle(type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="preferredCompetitionLevel"
              className="block text-sm font-medium text-gray-700"
            >
              Competition Level
            </label>
            <select
              id="preferredCompetitionLevel"
              name="preferredCompetitionLevel"
              value={formData.preferredCompetitionLevel}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select level</option>
              <option value="recreational">Recreational</option>
              <option value="league">League</option>
              <option value="competitive">Competitive</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="lookingForTeam"
                checked={formData.lookingForTeam}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">I'm currently looking for a team</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="openToSubstitute"
                checked={formData.openToSubstitute}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                I'm open to being a substitute bowler
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tell us about your bowling experience, goals, and what you're looking for in a team..."
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Profile..." : "Complete Profile"}
          </button>
        )}
      </div>
    </form>
  );
}
