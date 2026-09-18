type CategorieType = "heftruck" | "reachtruck" | "hhopt" | "hopt" | "ept" | "bakwagen" | "strapmachine" | "lader" | "generiek";

function matchCategorie(naam: string | undefined): CategorieType {
  const n = (naam ?? "").toLowerCase();
  if (n.includes("reach")) return "reachtruck";
  if (n.includes("hef")) return "heftruck";
  // Let op volgorde: "hhopt" bevat ook "hopt", dus die check moet eerst.
  if (n.includes("hhopt")) return "hhopt";
  if (n.includes("hopt")) return "hopt";
  if (n.includes("ept")) return "ept";
  if (n.includes("bakwagen") || n.includes("busje") || n.includes("bus")) return "bakwagen";
  if (n.includes("strap")) return "strapmachine";
  if (n.includes("laad") || n.includes("lader") || n.includes("charg")) return "lader";
  return "generiek";
}

/* Donkere, warme, matte tinten i.p.v. felle Tailwind-kleuren — sluit aan bij
   de zwart/wit REV'IT-stijl. Onderscheid tussen categorieën komt nu vooral
   uit het silhouet, kleur is subtiel ondersteunend. */
const STIJLEN: Record<CategorieType, { gradient: string; ring: string; icon: string }> = {
  heftruck: {
    gradient: "from-[#8a6a42] to-[#54402a]",
    ring: "ring-[#8a6a42]/25",
    icon: "text-white/90",
  },
  reachtruck: {
    gradient: "from-[#75665a] to-[#453a32]",
    ring: "ring-[#75665a]/25",
    icon: "text-white/90",
  },
  hhopt: {
    gradient: "from-[#726f52] to-[#44422e]",
    ring: "ring-[#726f52]/25",
    icon: "text-white/90",
  },
  hopt: {
    gradient: "from-[#835b46] to-[#4f382b]",
    ring: "ring-[#835b46]/25",
    icon: "text-white/90",
  },
  ept: {
    gradient: "from-[#8f6c55] to-[#5a4536]",
    ring: "ring-[#8f6c55]/25",
    icon: "text-white/90",
  },
  bakwagen: {
    gradient: "from-[#5c554b] to-[#36322c]",
    ring: "ring-[#5c554b]/25",
    icon: "text-white/90",
  },
  strapmachine: {
    gradient: "from-[#75463f] to-[#452824]",
    ring: "ring-[#75463f]/25",
    icon: "text-white/90",
  },
  lader: {
    gradient: "from-[#4a6b5c] to-[#2b3f36]",
    ring: "ring-[#4a6b5c]/25",
    icon: "text-white/90",
  },
  generiek: {
    gradient: "from-[#6a655d] to-[#403c37]",
    ring: "ring-[#403c37]/25",
    icon: "text-white/90",
  },
};

/** Duidelijke, herkenbare "app-icoon"-tegel per truck-categorie: eigen kleur + silhouet. */
export function AssetIcon({ categorie, className = "" }: { categorie: string | undefined; className?: string }) {
  const type = matchCategorie(categorie);
  const stijl = STIJLEN[type];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ${stijl.gradient} ${stijl.ring} ${className}`}
    >
      <Icon type={type} className={stijl.icon} />
    </div>
  );
}

function Icon({ type, className }: { type: CategorieType; className: string }) {
  switch (type) {
    case "heftruck":
      return (
        <svg viewBox="0 0 40 40" className={`h-[68%] w-[68%] ${className}`} fill="none">
          {/* Contragewicht + cabine (achter, hoog) */}
          <path d="M20 8h6.5a3 3 0 0 1 3 3v11h-9.5V8Z" fill="currentColor" />
          <rect x="22.5" y="11" width="4.5" height="4.5" rx="0.8" className="fill-white/55" />
          {/* Body/chassis (laag) */}
          <rect x="12" y="19" width="17.5" height="6" rx="1.3" fill="currentColor" />
          {/* Mast (voorop, verticaal, kenmerkend) */}
          <rect x="8.5" y="4" width="2.4" height="24" rx="1" fill="currentColor" />
          <rect x="13" y="4" width="2.4" height="24" rx="1" fill="currentColor" />
          <rect x="8.5" y="16" width="6.9" height="2.2" rx="1" fill="currentColor" opacity="0.8" />
          {/* Vorken, laag en vooruitstekend */}
          <rect x="2" y="27.5" width="13.5" height="2.6" rx="1" fill="currentColor" />
          {/* Wielen */}
          <circle cx="15.5" cy="31" r="3.4" fill="currentColor" />
          <circle cx="26" cy="31" r="3.4" fill="currentColor" />
          <circle cx="15.5" cy="31" r="1.3" className="fill-white/70" />
          <circle cx="26" cy="31" r="1.3" className="fill-white/70" />
        </svg>
      );
    case "reachtruck":
      return (
        <svg viewBox="0 0 40 40" className={`h-[68%] w-[68%] ${className}`} fill="none">
          {/* Zeer hoge mast — het kenmerk van een reachtruck */}
          <rect x="17.2" y="1.5" width="2.3" height="30" rx="1" fill="currentColor" />
          <rect x="21.7" y="1.5" width="2.3" height="30" rx="1" fill="currentColor" />
          <rect x="17.2" y="7" width="6.8" height="2.1" rx="1" fill="currentColor" opacity="0.8" />
          <rect x="17.2" y="13" width="6.8" height="2.1" rx="1" fill="currentColor" opacity="0.55" />
          {/* Smal chassis met cabine */}
          <rect x="19" y="22" width="10" height="9" rx="1.4" fill="currentColor" />
          <rect x="21" y="24.3" width="6" height="4" rx="0.8" className="fill-white/55" />
          {/* Uitstekende, smalle straddle-benen — onderscheidend t.o.v. de heftruck */}
          <rect x="4" y="28.7" width="16" height="2" rx="1" fill="currentColor" />
          <rect x="4" y="24.4" width="16" height="2" rx="1" fill="currentColor" opacity="0.7" />
          {/* Wielen aan het eind van de benen */}
          <circle cx="6.5" cy="33" r="2.6" fill="currentColor" />
          <circle cx="27" cy="33" r="3.2" fill="currentColor" />
          <circle cx="6.5" cy="33" r="1" className="fill-white/70" />
          <circle cx="27" cy="33" r="1.2" className="fill-white/70" />
        </svg>
      );
    case "hhopt":
      return (
        // Hoge order picker: operator rijdt mee omhoog in een kooi aan een hoge mast.
        <svg viewBox="0 0 40 40" className={`h-[68%] w-[68%] ${className}`} fill="none">
          {/* Hoge mast */}
          <rect x="17.5" y="2" width="2.3" height="26" rx="1" fill="currentColor" />
          <rect x="22" y="2" width="2.3" height="26" rx="1" fill="currentColor" />
          <rect x="17.5" y="8" width="6.8" height="2" rx="1" fill="currentColor" opacity="0.55" />
          {/* Kooi/platform waar de operator in meerijdt, hoog aan de mast */}
          <rect x="7" y="13" width="11" height="8" rx="1.3" fill="currentColor" />
          <path d="M9 13v-2.2a1.3 1.3 0 0 1 1.3-1.3h6.4A1.3 1.3 0 0 1 18 10.8V13" stroke="currentColor" strokeWidth="1.8" />
          {/* Onderstel */}
          <rect x="14" y="27" width="12" height="5.5" rx="1.2" fill="currentColor" />
          <rect x="4" y="30.5" width="14" height="2.2" rx="1" fill="currentColor" opacity="0.85" />
          {/* Wielen */}
          <circle cx="9" cy="35" r="2.6" fill="currentColor" />
          <circle cx="23" cy="35" r="2.6" fill="currentColor" />
          <circle cx="9" cy="35" r="1" className="fill-white/70" />
          <circle cx="23" cy="35" r="1" className="fill-white/70" />
        </svg>
      );
    case "hopt":
      return (
        // Lage order picker: operator loopt/staat op grondniveau mee, korte mast.
        <svg viewBox="0 0 40 40" className={`h-[62%] w-[62%] ${className}`} fill="none">
          {/* Korte mast */}
          <rect x="22" y="9" width="2.4" height="13" rx="1" fill="currentColor" />
          <rect x="18" y="9" width="8.5" height="2.3" rx="1" fill="currentColor" opacity="0.8" />
          {/* Breed, laag platform waar de operator op staat */}
          <rect x="6" y="21" width="22" height="5" rx="1.4" fill="currentColor" />
          <rect x="9" y="16.5" width="7" height="4.5" rx="1" fill="currentColor" opacity="0.6" />
          {/* Vorken */}
          <rect x="1" y="28.5" width="14" height="2.4" rx="1" fill="currentColor" opacity="0.85" />
          {/* Wielen */}
          <circle cx="12" cy="30.5" r="2.8" fill="currentColor" />
          <circle cx="24" cy="30.5" r="2.8" fill="currentColor" />
          <circle cx="12" cy="30.5" r="1" className="fill-white/70" />
          <circle cx="24" cy="30.5" r="1" className="fill-white/70" />
        </svg>
      );
    case "ept":
      return (
        // Elektrische pallettruck: geen mast, alleen dissel + lage vorken.
        <svg viewBox="0 0 40 40" className={`h-[56%] w-[56%] ${className}`} fill="none">
          {/* Dissel/stuur, schuin omhoog */}
          <rect x="24" y="6" width="2.6" height="14" rx="1.2" fill="currentColor" transform="rotate(28 25.3 13)" />
          <rect x="27" y="6.5" width="6" height="2.4" rx="1" fill="currentColor" opacity="0.85" />
          {/* Compact motorhuis */}
          <rect x="19" y="18" width="10" height="8" rx="1.6" fill="currentColor" />
          {/* Lage vorken, pallethoogte */}
          <rect x="2" y="27" width="24" height="2.6" rx="1" fill="currentColor" opacity="0.9" />
          <rect x="2" y="22.3" width="24" height="2.2" rx="1" fill="currentColor" opacity="0.6" />
          {/* Wielen */}
          <circle cx="8" cy="30.5" r="2.6" fill="currentColor" />
          <circle cx="24" cy="30.5" r="2.6" fill="currentColor" />
          <circle cx="8" cy="30.5" r="1" className="fill-white/70" />
          <circle cx="24" cy="30.5" r="1" className="fill-white/70" />
        </svg>
      );
    case "bakwagen":
      return (
        <svg viewBox="0 0 40 40" className={`h-[62%] w-[62%] ${className}`} fill="none">
          {/* Laadbak */}
          <rect x="3" y="10" width="20" height="16" rx="2" fill="currentColor" />
          <rect x="6" y="13" width="14" height="1.8" rx="0.9" className="fill-white/40" />
          <rect x="6" y="17" width="14" height="1.8" rx="0.9" className="fill-white/25" />
          {/* Cabine */}
          <path d="M23 15h6.5L33 20v6H23z" fill="currentColor" opacity="0.9" />
          <rect x="25.5" y="17" width="4.5" height="4" rx="0.8" className="fill-white/60" />
          {/* Wielen */}
          <circle cx="10" cy="29" r="3.4" fill="currentColor" />
          <circle cx="27" cy="29" r="3.4" fill="currentColor" />
          <circle cx="10" cy="29" r="1.3" className="fill-white/70" />
          <circle cx="27" cy="29" r="1.3" className="fill-white/70" />
        </svg>
      );
    case "strapmachine":
      return (
        <svg viewBox="0 0 40 40" className={`h-[62%] w-[62%] ${className}`} fill="none">
          {/* Pallet met dozen */}
          <rect x="7" y="30" width="26" height="3" rx="1" fill="currentColor" opacity="0.7" />
          <rect x="10" y="14" width="9" height="16" rx="1.2" fill="currentColor" />
          <rect x="21" y="18" width="9" height="12" rx="1.2" fill="currentColor" opacity="0.85" />
          {/* Strapping-banden eromheen */}
          <rect x="8" y="17" width="24" height="2.2" rx="1.1" className="fill-white/85" />
          <rect x="8" y="24" width="24" height="2.2" rx="1.1" className="fill-white/85" />
        </svg>
      );
    case "lader":
      return (
        <svg viewBox="0 0 40 40" className={`h-[62%] w-[62%] ${className}`} fill="none">
          {/* Laadstation-behuizing met kabel + stekker */}
          <rect x="9" y="4" width="16" height="24" rx="2.5" fill="currentColor" />
          <rect x="13" y="8.5" width="8" height="2" rx="1" className="fill-white/55" />
          <path d="M17 27v3a5 5 0 0 0 5 5h4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <rect x="26.5" y="32.5" width="7" height="5" rx="1.3" fill="currentColor" />
          <rect x="28" y="30.5" width="1.6" height="2.5" rx="0.6" fill="currentColor" />
          <rect x="31" y="30.5" width="1.6" height="2.5" rx="0.6" fill="currentColor" />
          {/* Bliksemschicht = "opladen" */}
          <path d="M18.5 13.5 14.5 19.5h3l-1.5 5 5-6.5h-3l1.5-4.5Z" className="fill-white/85" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className={`h-[62%] w-[62%] ${className}`} fill="none">
          <rect x="6" y="12" width="28" height="20" rx="2.5" fill="currentColor" />
          <path d="M13 12v-3a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" stroke="currentColor" strokeWidth="2.4" />
        </svg>
      );
  }
}
