import { typeColors } from "../data/fakeData";

export const Legend = () => {
  return (
    <div className="legend">
      {Object.entries(typeColors).map(([type, color]) => (
        <div key={type} className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: color }} />
          <span>{type}</span>
        </div>
      ))}
    </div>
  );
};
