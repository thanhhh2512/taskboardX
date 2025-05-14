"use client";

import React from "react";
import { useNotificationStore } from "@/app/hooks/useNotificationStore";

export function Header() {
  // Add mock notifications for demo purposes
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  // Add some mock notifications for testing purposes
  React.useEffect(() => {
    // Only run this once on initial load in the client
    if (typeof window !== "undefined") {
      // Add with a slight delay to ensure hydration is complete
      const timer = setTimeout(() => {
        addNotification(
          "Welcome to TaskBoardX",
          "info",
          "Start by creating your first project!"
        );
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [addNotification]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-8">
      <div className="flex flex-1 items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          {/* Header content goes here */}
        </div>
      </div>
    </header>
  );
}

export default Header;
