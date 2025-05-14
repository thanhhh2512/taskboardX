"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { useNotificationStore } from "@/app/hooks/useNotificationStore";
import { format } from "date-fns";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);

  // Close popover when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Mark notification as read when clicked
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  // Format notification timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return format(date, "h:mm a");
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  // Get icon color based on notification type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="fixed bottom-8 right-14 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 relative w-14 h-14 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <Bell
              className="h-20 w-20  "
              style={{ width: "1.3rem", height: "1.3rem" }}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[13px] text-white ">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-4"
          align="end"
          side="top"
          alignOffset={-40}
          sideOffset={16}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-blue-500"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <CardDescription>
                {unreadCount
                  ? `You have ${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "No new notifications"}
              </CardDescription>
            </CardHeader>
            <ScrollArea className="h-[300px]">
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex cursor-pointer items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !notification.read
                            ? "bg-gray-50 dark:bg-gray-800/50"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div
                          className={`mr-3 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${getNotificationColor(
                            notification.type
                          )}`}
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              !notification.read ? "font-medium" : ""
                            }`}
                          >
                            {notification.message}
                          </p>
                          {notification.description && (
                            <p className="mt-1 text-xs text-gray-500">
                              {notification.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </ScrollArea>
            <Separator />
            <CardFooter className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default NotificationBell;
