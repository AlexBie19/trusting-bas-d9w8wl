import { ZoomLevel } from "../types";

interface ToolbarProps {
  zoom: ZoomLevel;
  showHistory: boolean;
  weekOffset: number;
  onZoomChange: (zoom: ZoomLevel) => void;
  onToggleHistory: () => void;
  onPrint: () => void;
  onSendMail: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export const Toolbar = ({
  zoom,
  showHistory,
  weekOffset,
  onZoomChange,
  onToggleHistory,
  onPrint,
  onSendMail,
  onPrevWeek,
  onNextWeek,
  onToday
}: ToolbarProps) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button type="button" className="nav-btn" onClick={onPrevWeek} title="Eine Woche zurück">◀ 1 Woche</button>
        <button type="button" className={`nav-btn today-btn${weekOffset === 0 ? " active" : ""}`} onClick={onToday} title="Zur aktuellen Woche" aria-pressed={weekOffset === 0}>Heute</button>
        <button type="button" className="nav-btn" onClick={onNextWeek} title="Eine Woche vor">1 Woche ▶</button>
      </div>

      <div className="toolbar-group">
        <label htmlFor="zoom">Zoom</label>
        <select id="zoom" value={zoom} onChange={(event) => onZoomChange(event.target.value as ZoomLevel)}>
          <option value="compact">Kompakt</option>
          <option value="standard">Standard</option>
          <option value="comfortable">Komfort</option>
        </select>
      </div>

      <div className="toolbar-group history-toggle">
        <label htmlFor="history">Historie laden</label>
        <input id="history" type="checkbox" checked={showHistory} onChange={onToggleHistory} />
      </div>

      <button type="button" onClick={onPrint}>Drucken</button>
      <button type="button" onClick={onSendMail}>Per E-Mail senden</button>
    </div>
  );
};
