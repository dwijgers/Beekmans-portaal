import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beekmans Portaal",
  description: "Onderhoudsmeldingen, vlootbeheer en facturatie voor Beekmans en hun klanten.",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

/* Standaard donkere modus, tenzij een eerdere expliciete keuze voor 'light'
   in localStorage staat — zelfde patroon als R'EMS, incl. de losse
   try/catch zodat een blokkerende localStorage (bv. strikte privacy-modus)
   niet de hele body-class-toewijzing laat stranden. */
const THEME_SCRIPT = `
  var t = null;
  try {
    t = localStorage.getItem('theme');
  } catch (e) {}
  if (t !== 'light') {
    document.documentElement.classList.add('dark');
  }
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
