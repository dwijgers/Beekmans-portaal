export function formatteerDatumTijd(datum: string | Date): string {
  return new Date(datum).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });
}

export function formatteerDatum(datum: string | Date): string {
  return new Date(datum).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" });
}

export function formatteerBedrag(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(bedrag);
}
