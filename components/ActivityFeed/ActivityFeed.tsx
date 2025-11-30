import Link from "next/link";
import { type ActivityLog } from "@/drizzle/schema";

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent activity yet</p>
        <p className="mt-2 text-sm text-gray-400">
          Start by browsing teams or creating your own!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: ActivityLog }) {
  const timeAgo = getTimeAgo(activity.createdAt);

  return (
    <div className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <div className="flex-shrink-0">
        <ActivityIcon type={activity.activityType} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
      </div>
      {activity.actionUrl && (
        <div className="flex-shrink-0">
          <Link
            href={activity.actionUrl}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View →
          </Link>
        </div>
      )}
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, string> = {
    team_invitation_sent: "📨",
    team_invitation_accepted: "✅",
    team_invitation_declined: "❌",
    player_application_sent: "📝",
    player_application_accepted: "👍",
    player_application_declined: "👎",
    team_joined: "🎳",
    team_left: "👋",
    team_created: "🆕",
    team_updated: "✏️",
    message_received: "💬",
    profile_updated: "👤",
    profile_verified: "✓",
  };

  const icon = iconMap[type] || "📌";

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-xl">
      {icon}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return new Date(date).toLocaleDateString();
}
