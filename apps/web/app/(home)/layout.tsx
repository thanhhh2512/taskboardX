import { Metadata } from "next";
import "@workspace/ui/styles/globals.css";

import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import NotificationBell from "@/components/NotificationBell";

// Import AppSidebarClient directly as it is a client component now
import AppSidebar from "@/components/AppSidebarClient";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "TaskBoardX - Smart Workflow & Task Dashboard",
  description: "Manage your tasks and projects with our intuitive kanban board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white transition-colors duration-200">
        <Providers>
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
          </SidebarProvider>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
