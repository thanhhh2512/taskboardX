import { Metadata } from "next";
import "@workspace/ui/styles/globals.css";



import { Providers } from "@/components/providers";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "TaskBoardX - Smart Workflow & Task Dashboard",
  description: "Manage your tasks and projects with our intuitive kanban board",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white transition-colors duration-200">
        <Providers>
          <main className="flex-1 overflow-auto flex flex-col">
            {/* <Header /> */}
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
