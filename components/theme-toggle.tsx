"use client";

import { useLayoutEffect, useState } from "react";

function hoortDonkerTeZijn(): boolean {
  try {
    return localStorage.getItem("theme") !== "light";
  } catch {
    return true;
  }
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // localStorage kan ontbreken/geblokkeerd zijn — de class staat dan al
    // goed via het inline script in app/layout.tsx, alleen het onthouden
    // van de keuze voor de volgende keer lukt dan niet.
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useLayoutEffect(() => {
    // Herstelt de 'dark'-class als die er (nog) niet op staat — bv. omdat
    // React 'm bij het (her)mounten heeft teruggezet naar de server-render
    // (die 'm nooit kent, zie het inline thema-script in app/layout.tsx en
    // de Next.js-docs over "preventing flash before hydration"). Draait vóór
    // de eerste paint en is een no-op zodra de class al klopt.
    const moetDonker = hoortDonkerTeZijn();
    document.documentElement.classList.toggle("dark", moetDonker);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(moetDonker);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !dark;
        setDark(next);
        applyTheme(next);
      }}
      aria-label={dark ? "Light theme" : "Dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300 hover:text-slate-900"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M20.7 14.9A9 9 0 1 1 9.1 3.3a7 7 0 0 0 11.6 11.6Z" />
        </svg>
      )}
    </button>
  );
}
