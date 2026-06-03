import { Tractor, PlannerEntry } from "../types";

interface PrintViewProps {
  entries: PlannerEntry[];
  tractors: Tractor[];
}

export const PrintView = ({ entries, tractors }: PrintViewProps) => {
  const tractorMap = new Map(tractors.map((tractor) => [tractor.id, tractor]));

  return (
    <div className="print-view">
      <h2>Planungsübersicht</h2>
      <table>
        <thead>
          <tr>
            <th>Seriennummer</th>
            <th>Schlepper</th>
            <th>Typ</th>
            <th>Task</th>
            <th>Beschreibung</th>
            <th>Zuständig</th>
            <th>Start</th>
            <th>Ende</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const tractor = tractorMap.get(entry.tractorId);
            return (
              <tr key={entry.id}>
                <td>{tractor?.serialNumber ?? "-"}</td>
                <td>{tractor?.name ?? "-"}</td>
                <td>{entry.type}</td>
                <td>{entry.title}</td>
                <td>{entry.description}</td>
                <td>{entry.owner}</td>
                <td>{entry.startDate ?? "-"}</td>
                <td>{entry.endDate ?? "-"}</td>
                <td>{entry.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
