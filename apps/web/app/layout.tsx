import { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import "@workspace/ui/styles/globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "TaskBoardX - Smart Workflow & Task Dashboard",
  description: "Manage your tasks and projects with our intuitive kanban board",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
