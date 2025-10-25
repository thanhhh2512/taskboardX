"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/providers/QueryProvider";
import Sidebar from "@/components/Sidebar";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import {Toaster} from "sonner";
// import {Toaster} from "@workspace/ui/components/sonner";

export default function ClientBody({
                                       children,
                                       fontSans,
                                       fontMono,
                                   }: {
    children: React.ReactNode;
    fontSans: NextFontWithVariable;
    fontMono: NextFontWithVariable;
}) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    return (
        <body
            className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
            suppressHydrationWarning
        >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
                {mounted && (
                    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
                        <div className="block md:hidden">
                            <div className="bg-gray-900 dark:bg-black text-white p-3">
                                <Sidebar />
                            </div>
                            <div className="">{children}</div>
                        </div>

                        <div className="hidden md:flex justify-center items-center min-h-screen p-9 bg-gray-300 dark:bg-gray-600">
                            <div className="flex h-[90vh] border border-gray-400 bg-white rounded-lg w-full dark:border-white/20 dark:bg-gray-700 text-black dark:text-white overflow-hidden">
                                <div className="w-64 h-full bg-gray-600 py-10 text-white rounded-l-lg dark:bg-black">
                                    <Sidebar />
                                </div>
                                <div
                                    className="flex-1 h-full overflow-y-auto
                                               [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
                                               dark:bg-gray-700 text-black dark:text-white"
                                >
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Toaster
                    richColors
                    position="top-center"
                    duration={1000}
                    toastOptions={{
                        classNames: {
                            toast: "w-auto inline-flex text-sm rounded-md shadow min-w-0",
                        },
                    }}
                />
            </QueryProvider>
        </ThemeProvider>
        </body>
    );
}
