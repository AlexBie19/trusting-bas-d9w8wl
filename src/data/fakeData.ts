import { addDays, subDays } from "date-fns";
import { PlannerEntry, Tractor } from "../types";
import { getVisibleRange, toDayKey } from "../utils/dates";

const { start } = getVisibleRange(new Date());

const makeRange = (offsetStart: number, offsetEnd: number) => ({
  startDate: toDayKey(addDays(start, offsetStart)),
  endDate: toDayKey(addDays(start, offsetEnd))
});

export const tractors: Tractor[] = [
  { id: "t1", name: "Fendt 724" },
  { id: "t2", name: "John Deere 8R" },
  { id: "t3", name: "Claas Axion 960" },
  { id: "t4", name: "Massey Ferguson 8S" },
  { id: "t5", name: "Deutz-Fahr 7250 TTV" },
  { id: "t6", name: "New Holland T7" }
];

export const owners = ["Max Müller", "Anna Schmidt", "Peter Wagner", "Lisa Bauer"];

export const entries: PlannerEntry[] = [
  { id: "e1", tractorId: "t1", type: "Leihvertrag", title: "Mietpaket Nord", description: "Kunde A Saisonstart", owner: "Max Müller", status: "confirmed", ...makeRange(1, 8) },
  { id: "e2", tractorId: "t2", type: "Leihvertrag", title: "Mietpaket Süd", description: "Kunde B Übergabe", owner: "Anna Schmidt", status: "planned", ...makeRange(10, 16) },
  { id: "e3", tractorId: "t3", type: "Felderprobung", title: "Bodenversuch Ost", description: "Messreihe 2026", owner: "Peter Wagner", status: "confirmed", ...makeRange(4, 9) },
  { id: "e4", tractorId: "t4", type: "Felderprobung", title: "Dauerlauf West", description: "Anbaugerätevergleich", owner: "Lisa Bauer", status: "draft", ...makeRange(14, 20) },
  { id: "e5", tractorId: "t1", type: "Umbau", title: "Hydraulik-Upgrade", description: "Kit 3 verbauen", owner: "Anna Schmidt", status: "planned", ...makeRange(11, 13) },
  { id: "e6", tractorId: "t2", type: "Reparatur", title: "Getriebeprüfung", description: "Schaltverhalten prüfen", owner: "Max Müller", status: "confirmed", ...makeRange(18, 21) },
  { id: "e7", tractorId: "t3", type: "Prüfstand", title: "Leistungstest", description: "PTO + Motor", owner: "Peter Wagner", status: "planned", ...makeRange(22, 25) },
  { id: "e8", tractorId: "t4", type: "Event", title: "Hausmesse", description: "Vorführfahrzeug bereitstellen", owner: "Lisa Bauer", status: "confirmed", ...makeRange(7, 7) },
  { id: "e9", tractorId: "t5", type: "Test", title: "Software-Validierung", description: "Steuergeräte-Update", owner: "Anna Schmidt", status: "draft", ...makeRange(9, 12) },
  { id: "e10", tractorId: "t6", type: "Umbau", title: "Kabinenumbau", description: "Komfortpaket", owner: "Max Müller", status: "planned", ...makeRange(3, 6) },
  { id: "e11", tractorId: "t5", type: "Reparatur", title: "Bremsanlage", description: "Sicherheitsprüfung", owner: "Peter Wagner", status: "confirmed", ...makeRange(24, 28) },
  { id: "e12", tractorId: "t6", type: "Prüfstand", title: "Dauertest 48h", description: "Belastung Zyklus", owner: "Lisa Bauer", status: "planned", ...makeRange(29, 32) },
  { id: "e13", tractorId: "t2", type: "Event", title: "Kundenvorführung", description: "Regionaltag", owner: "Anna Schmidt", status: "planned", ...makeRange(30, 31) },
  { id: "e14", tractorId: "t3", type: "Test", title: "Kaltstart-Test", description: "Morgensimulation", owner: "Max Müller", status: "unscheduled", startDate: null, endDate: null },
  { id: "e15", tractorId: "t4", type: "Umbau", title: "GPS-Nachrüstung", description: "Antennenmodul", owner: "Peter Wagner", status: "unscheduled", startDate: null, endDate: null },
  { id: "e16", tractorId: "t1", type: "Leihvertrag", title: "Historie: Frühjahrsmiete", description: "Alte Planung", owner: "Lisa Bauer", status: "confirmed", startDate: toDayKey(subDays(start, 12)), endDate: toDayKey(subDays(start, 8)) }
];

export const typeColors: Record<string, string> = {
  Leihvertrag: "#2f6df6",
  Felderprobung: "#2ca55d",
  Umbau: "#f08c2e",
  Prüfstand: "#de3b3b",
  Reparatur: "#f2c94c",
  Event: "#8f5ad9",
  Test: "#19b8d8"
};
