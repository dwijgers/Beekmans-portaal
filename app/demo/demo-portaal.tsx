"use client";

import { BeekmansPortalView } from "@/components/demo/beekmans-portal-view";
import {
  PORTAL_FACTUREN,
  PORTAL_KLANTEN,
  PORTAL_MELDINGEN,
  PORTAL_VERHUURVLOOT,
  PORTAL_VLOOT,
  PORTAL_VOORRAAD,
} from "@/lib/demo/demo-data";

export function DemoPortaal() {
  return (
    <BeekmansPortalView
      meldingen={PORTAL_MELDINGEN}
      klanten={PORTAL_KLANTEN}
      vloot={PORTAL_VLOOT}
      verhuurvloot={PORTAL_VERHUURVLOOT}
      voorraad={PORTAL_VOORRAAD}
      facturen={PORTAL_FACTUREN}
      label="Demo — geen productiedata"
    />
  );
}
