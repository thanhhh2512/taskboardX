import { Toaster } from "sonner";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps): React.JSX.Element {
  return (
    <>
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
      <Toaster position="top-right" />
    </>
  );
}
