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
  onCellMouseDown: (row: number, day: number) => void;
  onCellMouseEnter: (row: number, day: number) => void;
  onCellMouseUp: () => void;
  onCellContextMenu: (event: React.MouseEvent<HTMLDivElement>, row: number, day: number, entryId?: string) => void;
  onTaskMove: (entryId: string, dayDelta: number) => void;
  onTaskContextMenu: (event: React.MouseEvent<HTMLDivElement>, entryId: string) => void;
  onDescriptionEdit: (entryId: string, newDescription: string) => void;
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
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onCellContextMenu,
  onTaskMove,
  onTaskContextMenu,
  onDescriptionEdit
}: PlannerRowProps) => {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(entry.description);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

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

      {/* Owner */}
      <div className="left-cell col-owner">{entry.owner || "—"}</div>

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
          onContextMenu={onTaskContextMenu}
          onDescriptionEdit={onDescriptionEdit}
        />
      </div>
    </div>
  );
};
