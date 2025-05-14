import { Metadata } from "next";
import "@workspace/ui/styles/globals.css";

import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sign Up - TaskBoardX",
  description: "Create your TaskBoardX account to manage projects and tasks",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white transition-colors duration-200">
        <Providers>
          <main className="flex-1 overflow-auto flex flex-col">
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
