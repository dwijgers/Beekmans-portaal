"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROL_LABELS } from "@/lib/roles";
import { isPlannerOfBeheerder } from "@/lib/roles";
import type { Gebruiker } from "@/lib/types";

type NavLink = { href: string; label: string; alleenPlannerOfBeheerder?: boolean };

const LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meldingen", label: "Meldingen" },
  { href: "/vloot", label: "Vloot" },
  { href: "/klanten", label: "Klanten", alleenPlannerOfBeheerder: true },
  { href: "/facturen", label: "Facturen", alleenPlannerOfBeheerder: true },
];

export function Nav({ gebruiker }: { gebruiker: Gebruiker }) {
  const pathname = usePathname();
  const magBeheer = isPlannerOfBeheerder(gebruiker.rol);
  const links = LINKS.filter((link) => !link.alleenPlannerOfBeheerder || magBeheer);

  return (
    <header className="glass-bar sticky top-0 z-10 border-b border-slate-200/60 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_4px_24px_-8px_rgba(15,23,42,0.08)]">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 active:opacity-70">
            <div className="glass flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">
              B
            </div>
            <span className="text-lg font-semibold tracking-tight">Beekmans</span>
          </Link>
          <nav className="hidden min-w-0 flex-wrap gap-1 text-sm sm:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                    active
                      ? "nav-pill-active"
                      : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="hidden text-slate-600 dark:text-slate-300 sm:inline">
            {gebruiker.naam} <span className="text-slate-400">· {ROL_LABELS[gebruiker.rol]}</span>
          </span>
          <ThemeToggle />
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-slate-300 bg-slate-200 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-200/60 px-4 py-2 text-sm sm:hidden">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-md px-3 py-1.5 font-medium ${
                active ? "nav-pill-active" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
