"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { Button } from "@workspace/ui/components/button";
import { Clock, Plus, ArrowRight, Trash2 } from "lucide-react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

interface HistoryListProps {
  onUpdateNotifications: () => void;
}

export default function HistoryList({
  onUpdateNotifications,
}: HistoryListProps) {
  const { history, clearHistory, markAsRead } = useTaskStore();

  useEffect(() => {
    onUpdateNotifications();
  }, [history, onUpdateNotifications]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      TODO: "To Do",
      IN_PROGRESS: "In Progress",
      DONE: "Done",
    };
    return statusMap[status] || status;
  };

  if (history.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              No activity yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              History will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-600">
        <div>History</div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              history.forEach((h) => {
                if (!h.read) markAsRead(h.id);
              });
              onUpdateNotifications();
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 h-auto py-1 px-2"
          >
            View all
          </Button>
          {history.length > 0 && (
            <Button
              onClick={() => {
                clearHistory();
                onUpdateNotifications();
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 h-auto py-1 px-2"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      <ScrollArea>
        <div className="max-h-96">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {history
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((h) => (
                <li
                  key={h.id}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                    h.read
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-700"
                  }`}
                  onClick={() => {
                    if (!h.read) {
                      markAsRead(h.id);
                      onUpdateNotifications();
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                      {h.action === "CREATE" && (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      {h.action === "UPDATE" && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      {h.action === "DELETE" && (
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium ${
                            h.action === "CREATE"
                              ? "text-green-600 dark:text-green-400"
                              : h.action === "UPDATE"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {h.action === "CREATE" && "Created"}
                          {h.action === "UPDATE" && "Updated"}
                          {h.action === "DELETE" && "Deleted"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(h.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{h.taskTitle}</span>
                      </p>
                      {h.action === "UPDATE" && h.fromStatus && h.toStatus && (
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {getStatusDisplay(h.fromStatus)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                            {getStatusDisplay(h.toStatus)}
                          </span>
                        </div>
                      )}
                      {h.action !== "UPDATE" && h.toStatus && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Status:{" "}
                          <span className="font-medium">
                            {getStatusDisplay(h.toStatus)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </ScrollArea>
    </div>
  );
}
