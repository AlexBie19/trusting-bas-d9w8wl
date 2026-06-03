import { format, getISOWeek, isSameDay } from "date-fns";
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
  owners: string[];
  onToggleTractor: (tractorId: string) => void;
  onCellMouseDown: (row: number, day: number) => void;
  onCellMouseEnter: (row: number, day: number) => void;
  onCellMouseUp: () => void;
  onCellContextMenu: (event: React.MouseEvent<HTMLDivElement>, row: number, day: number, entryId?: string) => void;
  onTaskMove: (entryId: string, dayDelta: number, finalClientY: number) => void;
  onTaskResizeEnd: (entryId: string, dayDelta: number) => void;
  onTaskContextMenu: (event: React.MouseEvent<HTMLDivElement>, entryId: string) => void;
  onDescriptionEdit: (entryId: string, newDescription: string) => void;
  onOwnerEdit: (entryId: string, newOwner: string) => void;
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
  owners,
  onToggleTractor,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onCellContextMenu,
  onTaskMove,
  onTaskResizeEnd,
  onTaskContextMenu,
  onDescriptionEdit,
  onOwnerEdit,
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

  // Build week groups for the KW header row
  const weekGroups: { weekNum: number; year: number; count: number }[] = [];
  days.forEach((day) => {
    const weekNum = getISOWeek(day);
    const year = day.getFullYear();
    const last = weekGroups[weekGroups.length - 1];
    if (!last || last.weekNum !== weekNum || last.year !== year) {
      weekGroups.push({ weekNum, year, count: 1 });
    } else {
      last.count++;
    }
  });

  return (
    <div className={`planner-grid${isSelecting ? " is-selecting" : ""}`} ref={gridRef}>
      {/* Header */}
      <div className="planner-header">
        <div className="left-header col-task">Seriennummer / Schlepper / Task</div>
        <div className="left-header col-desc">Beschreibung</div>
        <div className="left-header col-owner">Zuständig</div>
        <div className="timeline-header-wrap" style={{ width: days.length * cellWidth }}>
          {/* Calendar week row */}
          <div className="kw-header-row">
            {weekGroups.map(({ weekNum, year, count }) => (
              <div
                key={`${year}-${weekNum}`}
                className="kw-header-cell"
                style={{ width: count * cellWidth }}
              >
                KW {weekNum}
              </div>
            ))}
          </div>
          {/* Day header row */}
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
      </div>

      {/* Body: grouped by tractor */}
      <div className="planner-body">
        {groups.map(({ tractor, entries: groupEntries }) => (
          <div key={tractor.id} className="planner-group" data-tractor-id={tractor.id}>
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
                    owners={owners}
                    onCellMouseDown={onCellMouseDown}
                    onCellMouseEnter={onCellMouseEnter}
                    onCellMouseUp={onCellMouseUp}
                    onCellContextMenu={onCellContextMenu}
                    onTaskMove={onTaskMove}
                    onTaskResizeEnd={onTaskResizeEnd}
                    onTaskContextMenu={onTaskContextMenu}
                    onDescriptionEdit={onDescriptionEdit}
                    onOwnerEdit={onOwnerEdit}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};
