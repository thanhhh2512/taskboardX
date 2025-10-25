"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Props = {
    href: string;
    children: ReactNode;
    onClickAction?: () => void;
};

export default function NavLink({ href, children,onClickAction }: Props) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClickAction}
            className={`flex items-center gap-2 pl-3 px-5 py-2 rounded-md transition ${
                isActive
                    ? "bg-gray-500 text-white text-left"
                    : "text-gray-200 hover:bg-gray-100/10 hover:text-white"
            }`}
        >
            {children}
        </Link>
    );
}
