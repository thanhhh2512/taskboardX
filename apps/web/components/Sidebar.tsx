"use client";

import {
  Folder,
  SquareCheck,
  User,
  LayoutDashboard,
  SunMedium,
  Moon,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const AppSidebar = React.memo(function AppSidebar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { title: "Projects", url: "/projects", icon: Folder },
    { title: "Tasks", url: "/tasks", icon: SquareCheck },
    { title: "Profile", url: "/profile", icon: User },
  ];

  const settings = [{ title: "Logout", url: "/login", icon: LogOut }];

  const isActiveTab = (url: string) =>
    url === pathname || pathname.startsWith(url + "/");

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    document.documentElement.classList.toggle("dark", resolvedTheme !== "dark");
  };

  const ThemeIcon = resolvedTheme === "dark" ? Moon : SunMedium;

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-gray-900 dark:bg-gray-900">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-gray-100" />
          <span className="font-bold text-lg text-gray-100">TaskBoardX</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="dark:bg-gray-800" />

      <SidebarContent>
        <SidebarGroup className="pt-20 pl-6 pr-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {tabs.map((tab) => (
                <SidebarMenuItem key={tab.title}>
                  <Link
                    href={tab.url}
                    prefetch={false}
                    className={`h-12 flex items-center gap-3 px-4 rounded-lg text-lg transition-colors ${
                      isActiveTab(tab.url)
                        ? "bg-gray-800 text-white"
                        : "text-gray-200 hover:bg-gray-800"
                    }`}
                  >
                    <tab.icon />
                    <span>{tab.title}</span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pl-6 pr-4 py-4 relative before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-[#6e6f6e] dark:before:bg-gray-800 before:my-2 before:mx-4">
        <SidebarMenu>
          <SidebarMenuItem className="mx-auto">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="mt-4 p-2 rounded-lg bg-gray-500/30 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                aria-label="Toggle theme"
              >
                <ThemeIcon
                  className="text-white"
                  style={{ width: "1.8rem", height: "1.8rem" }}
                />
              </button>
            )}
          </SidebarMenuItem>

          {settings.map((setting) => (
            <SidebarMenuItem key={setting.title}>
              <Link
                href={setting.url}
                prefetch={false}
                className="h-12 flex items-center gap-3 px-4 rounded-lg text-lg text-gray-200 hover:bg-gray-800 transition-colors"
              >
                <setting.icon />
                <span>{setting.title}</span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
});
