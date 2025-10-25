import type { ReactNode } from "react";

import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

import { Toaster } from "sonner";
import NotificationBell from "@/components/NotificationBell";
import AppSidebar from "@/components/AppSidebarClient";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto flex flex-col bg-white dark:bg-gray-900">
          <div className="flex-1 overflow-auto">
            {/* nếu SidebarTrigger là client component, hãy di chuyển nó ra khỏi Server layout */}
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </div>

      <NotificationBell />
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}
