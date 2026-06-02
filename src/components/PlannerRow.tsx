import { format } from "date-fns";
import { PlannerEntry, SelectionRange, Tractor } from "../types";
import { TaskBar } from "./TaskBar";

interface PlannerRowProps {
  rowIndex: number;
  entry: PlannerEntry;
  tractor?: Tractor;
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

const isSelectedCell = (selection: SelectionRange | null, row: number, day: number) => {
  if (!selection) return false;
  return row >= selection.rowStart && row <= selection.rowEnd && day >= selection.dayStart && day <= selection.dayEnd;
};

export const PlannerRow = ({
  rowIndex,
  entry,
  tractor,
  days,
  cellWidth,
  selection,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  onCellContextMenu,
  onTaskMove,
  onTaskContextMenu
}: PlannerRowProps) => {
  return (
    <div className="planner-row">
      <div className="left-cell tractor">{tractor?.name ?? ""}</div>
      <div className="left-cell description">{entry.description || entry.title}</div>
      <div className="left-cell owner">{entry.owner || "-"}</div>

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
              onContextMenu={(event) => onCellContextMenu(event, rowIndex, dayIndex)}
              title={format(day, "dd.MM.yyyy")}
            />
          );
        })}

        <TaskBar entry={entry} gridStart={days[0]} cellWidth={cellWidth} onMove={onTaskMove} onContextMenu={onTaskContextMenu} />
      </div>
    </div>
  );
};
