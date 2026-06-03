import { format } from "date-fns";
import { useRef, useState } from "react";
import { PlannerEntry, SelectionRange } from "../types";
import { TaskBar } from "./TaskBar";

interface PlannerRowProps {
  rowIndex: number;
  entry: PlannerEntry;
  days: Date[];
  cellWidth: number;
  selection: SelectionRange | null;
  owners: string[];
  onCellMouseDown: (row: number, day: number) => void;
  onCellMouseEnter: (row: number, day: number) => void;
  onCellMouseUp: () => void;
  onCellContextMenu: (event: React.MouseEvent<HTMLDivElement>, row: number, day: number, entryId?: string) => void;
  onTaskMove: (entryId: string, dayDelta: number, finalClientY: number) => void;
  onTaskResizeEnd: (entryId: string, dayDelta: number) => void;
  onTaskContextMenu: (event: React.MouseEvent<HTMLDivElement>, entryId: string) => void;
  onDescriptionEdit: (entryId: string, newDescription: string) => void;
  onOwnerEdit: (entryId: string, newOwner: string) => void;
}

const isSelectedCell = (selection: SelectionRange | null, row: number, day: number) => {
  if (!selection) return false;
  return row >= selection.rowStart && row <= selection.rowEnd && day >= selection.dayStart && day <= selection.dayEnd;
};

export const PlannerRow = ({
  rowIndex,
  entry,
  days,
  cellWidth,
  selection,
  owners,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onCellContextMenu,
  onTaskMove,
  onTaskResizeEnd,
  onTaskContextMenu,
  onDescriptionEdit,
  onOwnerEdit
}: PlannerRowProps) => {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(entry.description);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState(entry.owner);
  const ownerInputRef = useRef<HTMLInputElement>(null);
  const ownerCancelledRef = useRef(false);

  const startDescEdit = () => {
    cancelledRef.current = false;
    setDescDraft(entry.description);
    setEditingDesc(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveDescEdit = () => {
    if (cancelledRef.current) return;
    onDescriptionEdit(entry.id, descDraft);
    setEditingDesc(false);
  };

  const cancelDescEdit = () => {
    cancelledRef.current = true;
    setDescDraft(entry.description);
    setEditingDesc(false);
  };

  const startOwnerEdit = () => {
    ownerCancelledRef.current = false;
    setOwnerDraft(entry.owner);
    setEditingOwner(true);
    setTimeout(() => ownerInputRef.current?.focus(), 0);
  };

  const saveOwnerEdit = () => {
    if (ownerCancelledRef.current) return;
    onOwnerEdit(entry.id, ownerDraft);
    setEditingOwner(false);
  };

  const cancelOwnerEdit = () => {
    ownerCancelledRef.current = true;
    setOwnerDraft(entry.owner);
    setEditingOwner(false);
  };

  return (
    <div className={`planner-row status-row-${entry.status}`}>
      {/* Task name + type badge */}
      <div className="left-cell col-task" title={`${entry.type}: ${entry.title}`}>
        <span className="task-type-badge" data-type={entry.type}>{entry.type}</span>
        <span className="task-title">{entry.title}</span>
      </div>

      {/* Description – inline editable on double-click */}
      <div
        className="left-cell col-desc"
        title={entry.description}
        onDoubleClick={startDescEdit}
      >
        {editingDesc ? (
          <input
            ref={inputRef}
            className="inline-edit-input"
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); saveDescEdit(); }
              if (e.key === "Escape") { e.preventDefault(); cancelDescEdit(); }
            }}
            onBlur={saveDescEdit}
          />
        ) : (
          <span className="desc-text">{entry.description || "—"}</span>
        )}
      </div>

      {/* Owner – inline editable on double-click */}
      <div
        className="left-cell col-owner"
        title={editingOwner ? undefined : (entry.owner || "Zuständige Person doppelklicken")}
        onDoubleClick={startOwnerEdit}
      >
        {editingOwner ? (
          <>
            <input
              ref={ownerInputRef}
              list={`owners-list-${entry.id}`}
              className="inline-edit-input"
              value={ownerDraft}
              onChange={(e) => setOwnerDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); saveOwnerEdit(); }
                if (e.key === "Escape") { e.preventDefault(); cancelOwnerEdit(); }
              }}
              onBlur={saveOwnerEdit}
              placeholder="Name eingeben..."
            />
            <datalist id={`owners-list-${entry.id}`}>
              {owners.map((o) => <option key={o} value={o} />)}
            </datalist>
          </>
        ) : (
          <span className="owner-text">{entry.owner || "—"}</span>
        )}
      </div>

      {/* Timeline cells */}
      <div className="timeline-row" style={{ width: days.length * cellWidth }}>
        {days.map((day, dayIndex) => {
          const weekend = day.getDay() === 0 || day.getDay() === 6;
          const selected = isSelectedCell(selection, rowIndex, dayIndex);

          return (
            <div
              key={`${rowIndex}-${dayIndex}`}
              className={`day-cell ${weekend ? "weekend" : ""} ${selected ? "selected" : ""}`}
              style={{ width: cellWidth }}
              onMouseDown={() => onCellMouseDown(rowIndex, dayIndex)}
              onMouseEnter={() => onCellMouseEnter(rowIndex, dayIndex)}
              onMouseUp={onCellMouseUp}
              onContextMenu={(event) => onCellContextMenu(event, rowIndex, dayIndex, entry.id)}
              title={format(day, "dd.MM.yyyy")}
            />
          );
        })}

        <TaskBar
          entry={entry}
          gridStart={days[0]}
          cellWidth={cellWidth}
          onMove={onTaskMove}
          onResizeEnd={onTaskResizeEnd}
          onContextMenu={onTaskContextMenu}
          onDescriptionEdit={onDescriptionEdit}
        />
      </div>
    </div>
  );
};
