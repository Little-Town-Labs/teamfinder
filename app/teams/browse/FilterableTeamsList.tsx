"use client";

import Link from "next/link";
import { useState } from "react";
import type { Team, User } from "@/drizzle/schema";

interface FilterableTeamsListProps {
  teams: Array<Team & { captain: User }>;
}

export function FilterableTeamsList({ teams }: FilterableTeamsListProps) {
  const [filters, setFilters] = useState({
    teamType: "",
    competitionLevel: "",
    genderType: "",
  });

  const filteredTeams = teams.filter((team) => {
    if (filters.teamType && team.teamType !== filters.teamType) {
      return false;
    }
    if (filters.competitionLevel && team.competitionLevel !== filters.competitionLevel) {
      return false;
    }
    if (filters.genderType && team.genderType !== filters.genderType) {
      return false;
    }
    return true;
  });

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      teamType: "",
      competitionLevel: "",
      genderType: "",
    });
  };

  const hasActiveFilters = filters.teamType || filters.competitionLevel || filters.genderType;

  return (
    <>
      {/* Filters Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filter Teams</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="teamType" className="block text-sm font-medium text-gray-700">
              Team Type
            </label>
            <select
              id="teamType"
              value={filters.teamType}
              onChange={(e) => handleFilterChange("teamType", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
              <option value="team">Team</option>
            </select>
          </div>

          <div>
            <label htmlFor="competitionLevel" className="block text-sm font-medium text-gray-700">
              Competition Level
            </label>
            <select
              id="competitionLevel"
              value={filters.competitionLevel}
              onChange={(e) => handleFilterChange("competitionLevel", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="recreational">Recreational</option>
              <option value="league">League</option>
              <option value="competitive">Competitive</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label htmlFor="genderType" className="block text-sm font-medium text-gray-700">
              Gender Type
            </label>
            <select
              id="genderType"
              value={filters.genderType}
              onChange={(e) => handleFilterChange("genderType", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="male">Men's Team</option>
              <option value="female">Women's Team</option>
              <option value="other">Mixed Team</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredTeams.length} of {teams.length} teams
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>

      {/* Teams List */}
      <div className="space-y-6">
        {filteredTeams.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">
              {hasActiveFilters
                ? "No teams match your filter criteria."
                : "No teams are currently looking for players."}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800">
                  Clear filters
                </button>
              ) : (
                "Check back later or create your own team!"
              )}
            </p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                    {team.lookingForPlayers && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Recruiting
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span className="capitalize">{team.teamType}</span>
                    <span>•</span>
                    <span className="capitalize">{team.competitionLevel}</span>
                    <span>•</span>
                    <span className="capitalize">
                      {team.genderType === "male"
                        ? "Men's"
                        : team.genderType === "female"
                          ? "Women's"
                          : "Mixed"}
                    </span>
                  </div>

                  {team.description && (
                    <p className="text-gray-700 mb-4 line-clamp-2">{team.description}</p>
                  )}

                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Open Positions:</span>
                      <span className="ml-1 font-medium text-gray-900">{team.openPositions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Roster:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {team.currentRosterSize}/{team.maxRosterSize}
                      </span>
                    </div>
                    {team.teamAverage && (
                      <div>
                        <span className="text-gray-500">Team Avg:</span>
                        <span className="ml-1 font-medium text-gray-900">{team.teamAverage}</span>
                      </div>
                    )}
                  </div>

                  {team.recruitmentRequirements && (
                    <div className="mt-3 text-sm text-gray-600">
                      {team.recruitmentRequirements.minAverage && (
                        <span>
                          Min Avg: {team.recruitmentRequirements.minAverage}
                          {team.recruitmentRequirements.maxAverage &&
                            ` - ${team.recruitmentRequirements.maxAverage}`}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Captain: {team.captain.firstName} {team.captain.lastName}
                  </div>
                </div>

                <div className="ml-4">
                  <Link
                    href={`/teams/${team.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
