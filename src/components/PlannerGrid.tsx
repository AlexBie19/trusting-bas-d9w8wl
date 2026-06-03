import { format, isSameDay } from "date-fns";
import { PlannerEntry, SelectionRange, Tractor } from "../types";
import { PlannerRow } from "./PlannerRow";

interface PlannerGridProps {
  entries: PlannerEntry[];
  tractors: Tractor[];
  days: Date[];
  cellWidth: number;
  selection: SelectionRange | null;
  isSelecting: boolean;
  collapsedTractorIds: string[];
  onToggleTractor: (tractorId: string) => void;
  onCellMouseDown: (row: number, day: number) => void;
  onCellMouseEnter: (row: number, day: number) => void;
  onCellMouseUp: () => void;
  onCellContextMenu: (event: React.MouseEvent<HTMLDivElement>, row: number, day: number, entryId?: string) => void;
  onTaskMove: (entryId: string, dayDelta: number) => void;
  onTaskContextMenu: (event: React.MouseEvent<HTMLDivElement>, entryId: string) => void;
  onDescriptionEdit: (entryId: string, newDescription: string) => void;
  gridRef?: React.RefObject<HTMLDivElement>;
}

export const PlannerGrid = ({
  entries,
  tractors,
  days,
  cellWidth,
  selection,
  isSelecting,
  collapsedTractorIds,
  onToggleTractor,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onCellContextMenu,
  onTaskMove,
  onTaskContextMenu,
  onDescriptionEdit,
  gridRef
}: PlannerGridProps) => {
  const today = new Date();
  const collapsedSet = new Set(collapsedTractorIds);

  // Group entries by tractorId, maintaining the tractor order from the tractors array
  const groups = tractors
    .map((tractor) => ({
      tractor,
      entries: entries.filter((e) => e.tractorId === tractor.id)
    }))
    .filter((group) => group.entries.length > 0);

  // Build a flat row index map (only task rows count for selection)
  let rowCounter = 0;
  const rowIndexByEntryId = new Map<string, number>();
  groups.forEach(({ tractor, entries: groupEntries }) => {
    if (collapsedSet.has(tractor.id)) return;
    groupEntries.forEach((entry) => {
      rowIndexByEntryId.set(entry.id, rowCounter);
      rowCounter++;
    });
  });

  return (
    <div className={`planner-grid${isSelecting ? " is-selecting" : ""}`} ref={gridRef}>
      {/* Header */}
      <div className="planner-header">
        <div className="left-header col-task">Seriennummer / Schlepper / Task</div>
        <div className="left-header col-desc">Beschreibung</div>
        <div className="left-header col-owner">Zuständig</div>
        <div className="timeline-header" style={{ width: days.length * cellWidth }}>
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const weekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={day.toISOString()}
                style={{ width: cellWidth }}
                className={`day-header ${weekend ? "weekend" : ""} ${isToday ? "today" : ""}`}
              >
                <div>{format(day, "EEE")}</div>
                <strong>{format(day, "dd.MM")}</strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body: grouped by tractor */}
      <div className="planner-body">
        {groups.map(({ tractor, entries: groupEntries }) => (
          <div key={tractor.id} className="planner-group">
            {/* Group header: Seriennummer + Schlepper name */}
            <div className="planner-group-header">
              <div className="group-left">
                <button
                  type="button"
                  className="collapse-btn"
                  onClick={() => onToggleTractor(tractor.id)}
                  aria-label={collapsedSet.has(tractor.id) ? "Schlepper ausklappen" : "Schlepper einklappen"}
                >
                  {collapsedSet.has(tractor.id) ? "▶" : "▼"}
                </button>
                <span className="group-serial">{tractor.serialNumber}</span>
                <span className="group-separator"> · </span>
                <span className="group-tractor">{tractor.name}</span>
                <span className="group-count">({groupEntries.length})</span>
              </div>
              <div className="group-timeline" style={{ width: days.length * cellWidth }}>
                {days.map((day) => {
                  const weekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`day-cell group-day-cell ${weekend ? "weekend" : ""}`}
                      style={{ width: cellWidth }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Task rows */}
            {!collapsedSet.has(tractor.id) &&
              groupEntries.map((entry) => {
                const rowIndex = rowIndexByEntryId.get(entry.id) ?? 0;
                return (
                  <PlannerRow
                    key={entry.id}
                    rowIndex={rowIndex}
                    entry={entry}
                    days={days}
                    cellWidth={cellWidth}
                    selection={selection}
                    onCellMouseDown={onCellMouseDown}
                    onCellMouseEnter={onCellMouseEnter}
                    onCellMouseUp={onCellMouseUp}
                    onCellContextMenu={onCellContextMenu}
                    onTaskMove={onTaskMove}
                    onTaskContextMenu={onTaskContextMenu}
                    onDescriptionEdit={onDescriptionEdit}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};
