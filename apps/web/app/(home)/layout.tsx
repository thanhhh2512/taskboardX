import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

import { Toaster } from "sonner";
import NotificationBell from "@/components/NotificationBell";

// Import AppSidebarClient directly as it is a client component now
import AppSidebar from "@/components/AppSidebarClient";
import Header from "@/components/Header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto flex flex-col bg-white dark:bg-gray-900">
          {/* <Header /> */}
          <div className="flex-1 overflow-auto">
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
