import { CSSProperties, useMemo, useRef, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { typeColors } from "../data/fakeData";
import { PlannerEntry } from "../types";
import { fromDayKey } from "../utils/dates";

interface TaskBarProps {
  entry: PlannerEntry;
  gridStart: Date;
  cellWidth: number;
  onMove: (entryId: string, dayDelta: number, finalClientY: number) => void;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>, entryId: string) => void;
  onDescriptionEdit: (entryId: string, newDescription: string) => void;
}

export const TaskBar = ({ entry, gridStart, cellWidth, onMove, onContextMenu, onDescriptionEdit }: TaskBarProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(entry.description);
  const dragOffsetRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const position = useMemo(() => {
    if (!entry.startDate || !entry.endDate) return null;

    const start = fromDayKey(entry.startDate);
    const end = fromDayKey(entry.endDate);
    const startOffset = differenceInCalendarDays(start, gridStart);
    const duration = Math.max(1, differenceInCalendarDays(end, start) + 1);

    return { left: startOffset * cellWidth, width: duration * cellWidth };
  }, [entry.startDate, entry.endDate, gridStart, cellWidth]);

  if (!position) {
    return (
      <div
        className="unscheduled-pill"
        onContextMenu={(event) => onContextMenu(event, entry.id)}
        title={`${entry.title} – Unscheduled`}
      >
        {entry.type}: {entry.title}
      </div>
    );
  }

  const style: CSSProperties = {
    left: position.left + dragOffset,
    width: position.width,
    backgroundColor: typeColors[entry.type]
  };

  if (entry.status === "draft") {
    style.backgroundImage = "repeating-linear-gradient(45deg, rgba(255,255,255,0.55), rgba(255,255,255,0.55) 6px, transparent 6px, transparent 12px)";
  }

  if (entry.status === "unscheduled") {
    style.borderStyle = "dashed";
  }

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    // Suppress drag when the inline description editor is open
    if (editingDesc) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    setDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const offset = moveEvent.clientX - startX;
      dragOffsetRef.current = offset;
      setDragOffset(offset);
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      const dayDelta = Math.round(dragOffsetRef.current / cellWidth);
      const xMoved = Math.abs(upEvent.clientX - startXRef.current);
      const yMoved = Math.abs(upEvent.clientY - startYRef.current);
      // Only treat as a drag if the pointer moved enough to be intentional
      if (xMoved > 4 || yMoved > 8) {
        onMove(entry.id, dayDelta, upEvent.clientY);
      }
      dragOffsetRef.current = 0;
      setDragOffset(0);
      setDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
    <div
      className={`task-bar status-${entry.status} ${dragging ? "dragging" : ""}`}
      style={style}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={(event) => {
        event.stopPropagation();
        onContextMenu(event, entry.id);
      }}
      title={`${entry.title}\n${entry.description}\n${entry.startDate} – ${entry.endDate}\nStatus: ${entry.status}\nZuständig: ${entry.owner}`}
    >
      {editingDesc ? (
        <input
          ref={inputRef}
          className="task-bar-inline-input"
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); saveDescEdit(); }
            if (e.key === "Escape") { e.preventDefault(); cancelDescEdit(); }
          }}
          onBlur={saveDescEdit}
          onClick={(e) => e.stopPropagation()}
          placeholder="Beschreibung..."
        />
      ) : (
        <span className="task-bar-label">{entry.title}</span>
      )}
    </div>
  );
};
