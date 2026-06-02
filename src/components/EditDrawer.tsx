import { useEffect, useState } from "react";
import { typeColors } from "../data/fakeData";
import { EntryStatus, EntryType, PlannerEntry, Tractor } from "../types";

interface EditDrawerProps {
  open: boolean;
  tractors: Tractor[];
  entry: PlannerEntry | null;
  onCancel: () => void;
  onSave: (entry: PlannerEntry) => void;
}

const statuses: EntryStatus[] = ["planned", "draft", "confirmed", "unscheduled"];
const types = Object.keys(typeColors) as EntryType[];

const createEmptyEntry = (): PlannerEntry => ({
  id: `new-${Date.now()}`,
  tractorId: "",
  type: "Umbau",
  title: "",
  description: "",
  owner: "",
  startDate: null,
  endDate: null,
  status: "planned"
});

export const EditDrawer = ({ open, tractors, entry, onCancel, onSave }: EditDrawerProps) => {
  const [draft, setDraft] = useState<PlannerEntry>(entry ?? createEmptyEntry());

  useEffect(() => {
    setDraft(entry ?? createEmptyEntry());
  }, [entry, open]);

  if (!open) return null;

  return (
    <div className="edit-drawer-overlay">
      <div className="edit-drawer">
        <h3>{entry ? "Aktion bearbeiten" : "Neue Aktion"}</h3>
        <div className="edit-grid">
          <label>Typ</label>
          <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as EntryType })}>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <label>Titel</label>
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />

          <label>Schlepper</label>
          <select value={draft.tractorId} onChange={(event) => setDraft({ ...draft, tractorId: event.target.value })}>
            <option value="">Bitte wählen</option>
            {tractors.map((tractor) => (
              <option key={tractor.id} value={tractor.id}>{tractor.name}</option>
            ))}
          </select>

          <label>Beschreibung</label>
          <input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />

          <label>Verantwortliche Person</label>
          <input value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} />

          <label>Startdatum</label>
          <input
            type="date"
            value={draft.startDate ?? ""}
            onChange={(event) => setDraft({ ...draft, startDate: event.target.value || null })}
            disabled={draft.status === "unscheduled"}
          />

          <label>Enddatum</label>
          <input
            type="date"
            value={draft.endDate ?? ""}
            onChange={(event) => setDraft({ ...draft, endDate: event.target.value || null })}
            disabled={draft.status === "unscheduled"}
          />

          <label>Status</label>
          <select
            value={draft.status}
            onChange={(event) => {
              const status = event.target.value as EntryStatus;
              setDraft({
                ...draft,
                status,
                startDate: status === "unscheduled" ? null : draft.startDate,
                endDate: status === "unscheduled" ? null : draft.endDate
              });
            }}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <label>Farbe/Typ</label>
          <div className="color-preview" style={{ backgroundColor: typeColors[draft.type] }}>{draft.type}</div>
        </div>

        <div className="drawer-actions">
          <button type="button" onClick={onCancel}>Abbrechen</button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={!draft.title || !draft.tractorId || !draft.owner || (draft.status !== "unscheduled" && (!draft.startDate || !draft.endDate))}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
