import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to home dashboard
  redirect("/login");
}
