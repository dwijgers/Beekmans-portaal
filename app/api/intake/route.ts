import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Urgentie } from "@/lib/types";

/**
 * Vast intake-contract waarmee ELK klantsysteem (R'EMS is er straks één van
 * de N) meldingen bij Beekmans binnenbrengt — geen maatwerk-koppelcode per
 * klant, alleen andere credentials.
 *
 * Auth per request (geen Supabase-sessie: het bronsysteem heeft geen
 * account, alleen een API-key + secret, zie klanten.api_key/webhook_secret
 * in 0001_init.sql):
 *   - Header "X-Beekmans-Api-Key": de klant.api_key.
 *   - Header "X-Beekmans-Signature": hex-HMAC-SHA256 van de ruwe request-body
 *     met klant.webhook_secret — hetzelfde schema als R'EMS's lib/webhook.ts
 *     al gebruikt om te ondertekenen. Verbind je een bronsysteem echt, zorg
 *     dan dat de header-naam aan die kant hierop aansluit (of stuur 'm onder
 *     beide namen totdat dat is aangepast).
 *
 * Body (application/json):
 *   {
 *     "externeReferentie"?: string,   // id in het bronsysteem — voorkomt dubbele meldingen bij een retry
 *     "assetNaam": string,
 *     "serienummer"?: string,         // matcht een bestaande, aan deze klant gekoppelde truck
 *     "omschrijving"?: string,
 *     "urgentie": "laag" | "gemiddeld" | "hoog" | "kritiek",
 *     "gemeldDoor"?: string,
 *     "gemeldOp"?: string,            // ISO-datetime, default: nu
 *     "aiAdvies"?: string,
 *     "fotos"?: string[]              // URL's
 *   }
 */

const URGENTIES: Urgentie[] = ["laag", "gemiddeld", "hoog", "kritiek"];

function verifySignature(rawBody: string, secret: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const verwacht = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(verwacht);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("X-Beekmans-Api-Key");
  const signature = request.headers.get("X-Beekmans-Signature");
  if (!apiKey) {
    return NextResponse.json({ error: "X-Beekmans-Api-Key ontbreekt" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: credentials } = await admin
    .from("klant_credentials")
    .select("klant_id, webhook_secret, klanten(id, actief)")
    .eq("api_key", apiKey)
    .maybeSingle<{ klant_id: string; webhook_secret: string; klanten: { id: string; actief: boolean } | null }>();
  if (!credentials || !credentials.klanten) {
    return NextResponse.json({ error: "Onbekende API-key" }, { status: 401 });
  }
  if (!credentials.klanten.actief) {
    return NextResponse.json({ error: "Deze klantkoppeling is gedeactiveerd" }, { status: 403 });
  }
  const klant = { id: credentials.klant_id };

  const rawBody = await request.text();
  if (!verifySignature(rawBody, credentials.webhook_secret, signature)) {
    return NextResponse.json({ error: "Ongeldige of ontbrekende X-Beekmans-Signature" }, { status: 401 });
  }

  let payload: {
    externeReferentie?: string;
    assetNaam?: string;
    serienummer?: string;
    omschrijving?: string;
    urgentie?: string;
    gemeldDoor?: string;
    gemeldOp?: string;
    aiAdvies?: string;
    fotos?: string[];
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body is geen geldige JSON" }, { status: 400 });
  }

  if (!payload.assetNaam) {
    return NextResponse.json({ error: "assetNaam is verplicht" }, { status: 400 });
  }
  if (!payload.urgentie || !URGENTIES.includes(payload.urgentie as Urgentie)) {
    return NextResponse.json(
      { error: `urgentie moet één van ${URGENTIES.join(", ")} zijn` },
      { status: 400 }
    );
  }

  let truckId: string | null = null;
  if (payload.serienummer) {
    const { data: truck } = await admin
      .from("trucks")
      .select("id")
      .eq("serienummer", payload.serienummer)
      .eq("huidige_klant_id", klant.id)
      .maybeSingle();
    truckId = truck?.id ?? null;
  }

  const { data: melding, error } = await admin
    .from("meldingen")
    .insert({
      klant_id: klant.id,
      truck_id: truckId,
      bron: "intake",
      externe_referentie: payload.externeReferentie ?? null,
      asset_naam: payload.assetNaam,
      omschrijving: payload.omschrijving ?? null,
      urgentie: payload.urgentie as Urgentie,
      gemeld_door: payload.gemeldDoor ?? null,
      gemeld_op: payload.gemeldOp ?? new Date().toISOString(),
      ai_advies: payload.aiAdvies ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // Unique-violation op (klant_id, externe_referentie) = een retry van
    // dezelfde melding vanuit het bronsysteem — geen fout, gewoon idempotent.
    if (error.code === "23505") {
      const { data: bestaande } = await admin
        .from("meldingen")
        .select("id")
        .eq("klant_id", klant.id)
        .eq("externe_referentie", payload.externeReferentie ?? "")
        .maybeSingle();
      return NextResponse.json({ id: bestaande?.id, duplicaat: true }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (payload.fotos && payload.fotos.length > 0) {
    await admin
      .from("melding_fotos")
      .insert(payload.fotos.map((url) => ({ melding_id: melding.id, url })));
  }

  return NextResponse.json({ id: melding.id }, { status: 201 });
}
