import { addDays, subDays } from "date-fns";
import { PlannerEntry, Tractor } from "../types";
import { getVisibleRange, toDayKey } from "../utils/dates";

const { start } = getVisibleRange(new Date());

const makeRange = (offsetStart: number, offsetEnd: number) => ({
  startDate: toDayKey(addDays(start, offsetStart)),
  endDate: toDayKey(addDays(start, offsetEnd))
});

export const tractors: Tractor[] = [
  { id: "t1", serialNumber: "702.20.0303", name: "Fendt 724" },
  { id: "t2", serialNumber: "703.21.0101", name: "John Deere 8R 410" },
  { id: "t3", serialNumber: "704.19.0055", name: "Claas Axion 960 CMATIC" },
  { id: "t4", serialNumber: "705.22.0200", name: "Massey Ferguson 8S.265" },
  { id: "t5", serialNumber: "706.20.0088", name: "Deutz-Fahr 7250 TTV" },
  { id: "t6", serialNumber: "707.23.0012", name: "New Holland T7.315" }
];

export const owners = ["Max Müller", "Anna Schmidt", "Peter Wagner", "Lisa Bauer", "Klaus Fischer"];

export const entries: PlannerEntry[] = [
  // Fendt 724 (t1) – 3 tasks
  { id: "e1",  tractorId: "t1", type: "Leihvertrag",  title: "Mietpaket Nord",       description: "Kunde A Saisonstart",          owner: "Max Müller",    status: "confirmed", ...makeRange(1, 8) },
  { id: "e5",  tractorId: "t1", type: "Umbau",        title: "Hydraulik-Upgrade",     description: "Kit 3 verbauen",               owner: "Anna Schmidt",  status: "planned",   ...makeRange(12, 14) },
  { id: "e16", tractorId: "t1", type: "Leihvertrag",  title: "Frühjahrsmiete",        description: "Alte Planung",                 owner: "Lisa Bauer",    status: "confirmed", startDate: toDayKey(subDays(start, 12)), endDate: toDayKey(subDays(start, 8)) },

  // John Deere 8R (t2) – 3 tasks
  { id: "e2",  tractorId: "t2", type: "Leihvertrag",  title: "Mietpaket Süd",         description: "Kunde B Übergabe",             owner: "Anna Schmidt",  status: "planned",   ...makeRange(10, 16) },
  { id: "e6",  tractorId: "t2", type: "Reparatur",    title: "Getriebeprüfung",        description: "Schaltverhalten prüfen",       owner: "Max Müller",    status: "confirmed", ...makeRange(18, 21) },
  { id: "e13", tractorId: "t2", type: "Event",        title: "Kundenvorführung",       description: "Regionaltag Südbayern",        owner: "Klaus Fischer", status: "planned",   ...makeRange(30, 31) },

  // Claas Axion 960 (t3) – 3 tasks
  { id: "e3",  tractorId: "t3", type: "Felderprobung", title: "Bodenversuch Ost",     description: "Messreihe 2026",               owner: "Peter Wagner",  status: "confirmed", ...makeRange(4, 9) },
  { id: "e7",  tractorId: "t3", type: "Prüfstand",    title: "Leistungstest",         description: "PTO + Motor Vollast",          owner: "Peter Wagner",  status: "planned",   ...makeRange(22, 25) },
  { id: "e14", tractorId: "t3", type: "Test",         title: "Kaltstart-Test",        description: "Morgensimulation bei -10°C",   owner: "Max Müller",    status: "unscheduled", startDate: null, endDate: null },

  // Massey Ferguson 8S (t4) – 3 tasks
  { id: "e4",  tractorId: "t4", type: "Felderprobung", title: "Dauerlauf West",       description: "Anbaugerätevergleich",         owner: "Lisa Bauer",    status: "draft",     ...makeRange(14, 20) },
  { id: "e8",  tractorId: "t4", type: "Event",        title: "Hausmesse",             description: "Vorführfahrzeug bereitstellen",owner: "Lisa Bauer",    status: "confirmed", ...makeRange(7, 7) },
  { id: "e15", tractorId: "t4", type: "Umbau",        title: "GPS-Nachrüstung",       description: "Antennenmodul einbauen",       owner: "Peter Wagner",  status: "unscheduled", startDate: null, endDate: null },

  // Deutz-Fahr 7250 (t5) – 3 tasks
  { id: "e9",  tractorId: "t5", type: "Test",         title: "Software-Validierung",  description: "Steuergeräte-Update v4.2",     owner: "Anna Schmidt",  status: "draft",     ...makeRange(9, 12) },
  { id: "e11", tractorId: "t5", type: "Reparatur",    title: "Bremsanlage",           description: "Sicherheitsprüfung §29",       owner: "Peter Wagner",  status: "confirmed", ...makeRange(24, 28) },
  { id: "e17", tractorId: "t5", type: "Prüfstand",    title: "Abgastest",             description: "Abgasmessung Stufe V",         owner: "Klaus Fischer", status: "planned",   ...makeRange(33, 36) },

  // New Holland T7 (t6) – 3 tasks
  { id: "e10", tractorId: "t6", type: "Umbau",        title: "Kabinenumbau",          description: "Komfortpaket XL",              owner: "Max Müller",    status: "planned",   ...makeRange(3, 6) },
  { id: "e12", tractorId: "t6", type: "Prüfstand",    title: "Dauertest 48h",         description: "Belastungszyklus Stufe 3",     owner: "Lisa Bauer",    status: "planned",   ...makeRange(29, 32) },
  { id: "e18", tractorId: "t6", type: "Felderprobung", title: "Hangfahrt-Test",       description: "Stabilität Hanglage >15%",     owner: "Klaus Fischer", status: "draft",     ...makeRange(40, 44) }
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
