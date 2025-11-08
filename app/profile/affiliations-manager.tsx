"use client";

import { useEffect, useState } from "react";

import type { Affiliation } from "@/drizzle/schema";

export default function AffiliationsManager() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAffiliation, setNewAffiliation] = useState({
    type: "college" as "college" | "company" | "organization" | "other",
    name: "",
    role: "",
    startYear: "",
    endYear: "",
  });

  useEffect(() => {
    fetchAffiliations();
  }, []);

  const fetchAffiliations = async () => {
    try {
      const response = await fetch("/api/affiliations");
      if (response.ok) {
        const data = (await response.json()) as { affiliations: Affiliation[] };
        setAffiliations(data.affiliations);
      }
    } catch {
      // Silently fail - affiliations are optional
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAffiliation.name.trim()) {
      setError("Name is required");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/affiliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAffiliation),
      });

      if (response.ok) {
        const data = (await response.json()) as { affiliation: Affiliation };
        setAffiliations([data.affiliation, ...affiliations]);
        setNewAffiliation({
          type: "college",
          name: "",
          role: "",
          startYear: "",
          endYear: "",
        });
        setIsAdding(false);
      } else {
        const data = (await response.json()) as { error: string };
        setError(data.error);
      }
    } catch {
      setError("Failed to add affiliation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this affiliation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/affiliations?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAffiliations(affiliations.filter((a) => a.id !== id));
      }
    } catch {
      // Silently fail
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Affiliations</h3>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Affiliation
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Add colleges, companies, or organizations you're affiliated with (optional)
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Add New Affiliation Form */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="affiliationType" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="affiliationType"
                value={newAffiliation.type}
                onChange={(e) =>
                  setNewAffiliation({
                    ...newAffiliation,
                    type: e.target.value as typeof newAffiliation.type,
                  })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="college">College/University</option>
                <option value="company">Company</option>
                <option value="organization">Organization</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="affiliationName" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="affiliationName"
                value={newAffiliation.name}
                onChange={(e) => setNewAffiliation({ ...newAffiliation, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., University of Michigan"
              />
            </div>

            <div>
              <label htmlFor="affiliationRole" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                id="affiliationRole"
                value={newAffiliation.role}
                onChange={(e) => setNewAffiliation({ ...newAffiliation, role: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Student, Employee, Member"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="affiliationStartYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Year
                </label>
                <input
                  type="text"
                  id="affiliationStartYear"
                  value={newAffiliation.startYear}
                  onChange={(e) =>
                    setNewAffiliation({ ...newAffiliation, startYear: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., 2015"
                />
              </div>

              <div>
                <label
                  htmlFor="affiliationEndYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Year
                </label>
                <input
                  type="text"
                  id="affiliationEndYear"
                  value={newAffiliation.endYear}
                  onChange={(e) =>
                    setNewAffiliation({ ...newAffiliation, endYear: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Present"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Affiliations List */}
      <div className="space-y-2">
        {isLoading && affiliations.length === 0 ? (
          <p className="text-sm text-gray-500">Loading affiliations...</p>
        ) : affiliations.length === 0 ? (
          <p className="text-sm text-gray-500">No affiliations added yet</p>
        ) : (
          affiliations.map((affiliation) => (
            <div
              key={affiliation.id}
              className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {getTypeLabel(affiliation.type)}
                  </span>
                  <span className="font-medium text-gray-900">{affiliation.name}</span>
                </div>
                {affiliation.role && (
                  <p className="text-sm text-gray-600 mt-1">{affiliation.role}</p>
                )}
                {(affiliation.startYear || affiliation.endYear) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {affiliation.startYear || "?"} - {affiliation.endYear || "Present"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(affiliation.id)}
                className="ml-4 text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
