import { Tractor, PlannerEntry } from "../types";

interface PrintViewProps {
  entries: PlannerEntry[];
  tractors: Tractor[];
}

export const PrintView = ({ entries, tractors }: PrintViewProps) => {
  const tractorMap = new Map(tractors.map((tractor) => [tractor.id, tractor.name]));

  return (
    <div className="print-view">
      <h2>Planungsübersicht</h2>
      <table>
        <thead>
          <tr>
            <th>Schlepper</th>
            <th>Typ</th>
            <th>Titel</th>
            <th>Beschreibung</th>
            <th>Zuständig</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{tractorMap.get(entry.tractorId)}</td>
              <td>{entry.type}</td>
              <td>{entry.title}</td>
              <td>{entry.description}</td>
              <td>{entry.owner}</td>
              <td>{entry.startDate ?? "-"}</td>
              <td>{entry.endDate ?? "-"}</td>
              <td>{entry.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
