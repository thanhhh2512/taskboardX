"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useHasMounted();

    if (!mounted) {
        return (
            <button className="px-3 py-2 rounded border bg-gray-200 text-gray-600">
                ...
            </button>
        );
    }

    return (
        <div
            className="flex items-center gap-2 cursor-pointer pl-3 px-10 py-2 rounded"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 180, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Moon className="w-4 h-4 text-white" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -180, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Sun className="w-4 h-4 text-white" />
                    </motion.div>
                )}
            </AnimatePresence>
            <span className="select-none">{theme === "dark" ? "Dark" : "Light"}</span>
        </div>
    );
}
