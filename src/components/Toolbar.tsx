import { ZoomLevel } from "../types";

interface ToolbarProps {
  zoom: ZoomLevel;
  showHistory: boolean;
  onZoomChange: (zoom: ZoomLevel) => void;
  onToggleHistory: () => void;
  onPrint: () => void;
  onSendMail: () => void;
}

export const Toolbar = ({ zoom, showHistory, onZoomChange, onToggleHistory, onPrint, onSendMail }: ToolbarProps) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <label htmlFor="zoom">Zoom</label>
        <select id="zoom" value={zoom} onChange={(event) => onZoomChange(event.target.value as ZoomLevel)}>
          <option value="compact">Compact</option>
          <option value="standard">Standard</option>
          <option value="comfortable">Comfortable</option>
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
