import type { ReactElement } from "react";
import { Toaster } from "sonner";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return (
    <>
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
      <Toaster position="top-right" />
    </>
  );
}
