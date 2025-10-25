import { Toaster } from "sonner";

interface SignupLayoutProps {
  children: React.ReactNode;
}

export default function SignupLayout({ children }: SignupLayoutProps): React.JSX.Element {
  return (
    <>
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
      <Toaster position="top-right" />
    </>
  );
}
