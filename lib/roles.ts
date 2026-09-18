import type { GebruikerRol } from "@/lib/types";

/** Planner heeft dezelfde beheerrechten als beheerder (klanten/vloot/facturen), op gebruikersbeheer na. */
export function isPlannerOfBeheerder(rol: GebruikerRol): boolean {
  return rol === "planner" || rol === "beheerder";
}

export const ROL_LABELS: Record<GebruikerRol, string> = {
  monteur: "Monteur",
  planner: "Planner",
  beheerder: "Beheerder",
};
