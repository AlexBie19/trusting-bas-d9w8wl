import { format, isSameDay } from "date-fns";
import { PlannerEntry, SelectionRange, Tractor } from "../types";
import { PlannerRow } from "./PlannerRow";

interface PlannerGridProps {
  entries: PlannerEntry[];
  tractors: Tractor[];
  days: Date[];
  cellWidth: number;
  selection: SelectionRange | null;
  onCellMouseDown: (row: number, day: number) => void;
  onCellMouseEnter: (row: number, day: number) => void;
  onCellMouseUp: () => void;
  onCellContextMenu: (event: React.MouseEvent<HTMLDivElement>, row: number, day: number) => void;
  onTaskMove: (entryId: string, dayDelta: number) => void;
  onTaskContextMenu: (event: React.MouseEvent<HTMLDivElement>, entryId: string) => void;
}

export const PlannerGrid = ({
  entries,
  tractors,
  days,
  cellWidth,
  selection,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onCellContextMenu,
  onTaskMove,
  onTaskContextMenu
}: PlannerGridProps) => {
  const tractorMap = new Map(tractors.map((tractor) => [tractor.id, tractor]));
  const today = new Date();

  return (
    <div className="planner-grid">
      <div className="planner-header">
        <div className="left-header">Schlepper</div>
        <div className="left-header">Beschreibung</div>
        <div className="left-header">Zuständige Person</div>
        <div className="timeline-header" style={{ width: days.length * cellWidth }}>
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const weekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div key={day.toISOString()} style={{ width: cellWidth }} className={`day-header ${weekend ? "weekend" : ""} ${isToday ? "today" : ""}`}>
                <div>{format(day, "EEE")}</div>
                <strong>{format(day, "dd.MM")}</strong>
              </div>
            );
          })}
        </div>
      </div>

      <div className="planner-body">
        {entries.map((entry, index) => (
          <PlannerRow
            key={entry.id}
            rowIndex={index}
            entry={entry}
            tractor={tractorMap.get(entry.tractorId)}
            days={days}
            cellWidth={cellWidth}
            selection={selection}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={onCellMouseEnter}
            onCellMouseUp={onCellMouseUp}
            onCellContextMenu={onCellContextMenu}
            onTaskMove={onTaskMove}
            onTaskContextMenu={onTaskContextMenu}
          />
        ))}
      </div>
    </div>
  );
};
