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
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg backdrop-blur-sm dark:from-gray-800 dark:to-gray-900/50 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filter Teams</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="teamType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Team Type
            </label>
            <select
              id="teamType"
              value={filters.teamType}
              onChange={(e) => handleFilterChange("teamType", e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
              <option value="team">Team</option>
            </select>
          </div>

          <div>
            <label htmlFor="competitionLevel" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Competition Level
            </label>
            <select
              id="competitionLevel"
              value={filters.competitionLevel}
              onChange={(e) => handleFilterChange("competitionLevel", e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="recreational">Recreational</option>
              <option value="league">League</option>
              <option value="competitive">Competitive</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label htmlFor="genderType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Gender Type
            </label>
            <select
              id="genderType"
              value={filters.genderType}
              onChange={(e) => handleFilterChange("genderType", e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
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
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Showing {filteredTeams.length} of {teams.length} teams
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>

      {/* Teams List */}
      <div className="space-y-6">
        {filteredTeams.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-12 text-center shadow-lg dark:from-gray-800 dark:to-gray-900/50">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {hasActiveFilters
                ? "No teams match your filter criteria."
                : "No teams are currently looking for players."}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/30">
                  Clear filters
                </button>
              ) : (
                "Check back later or create your own team!"
              )}
            </p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team.id} className="group overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:from-gray-900 dark:to-gray-800/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{team.name}</h3>
                    {team.lookingForPlayers && (
                      <span className="rounded-full bg-gradient-to-r from-green-100 to-green-200/50 px-3 py-1 text-xs font-semibold text-green-800 shadow-sm dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40"
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
