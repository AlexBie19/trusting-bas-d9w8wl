import { useMemo, useState } from "react";
import { ContextMenu } from "./components/ContextMenu";
import { EditDrawer } from "./components/EditDrawer";
import { FilterBar } from "./components/FilterBar";
import { Legend } from "./components/Legend";
import { PlannerGrid } from "./components/PlannerGrid";
import { PrintView } from "./components/PrintView";
import { Toolbar } from "./components/Toolbar";
import { entries as fakeEntries, tractors } from "./data/fakeData";
import { PlannerEntry, PlannerFilters, SelectionRange, ZoomLevel } from "./types";
import { getVisibleDays, toDayKey } from "./utils/dates";
import { filterEntries, moveEntryByDays, moveEntryToStartDate, sortEntries } from "./utils/planner";
import "./styles.css";

const defaultFilters: PlannerFilters = {
  type: "",
  owner: "",
  status: "",
  tractorId: ""
};

const zoomWidths: Record<ZoomLevel, number> = {
  compact: 24,
  standard: 32,
  comfortable: 42
};

interface ContextState {
  x: number;
  y: number;
  entryId?: string;
  row?: number;
  day?: number;
}

function App() {
  const [allEntries, setAllEntries] = useState<PlannerEntry[]>(fakeEntries);
  const [filters, setFilters] = useState<PlannerFilters>(defaultFilters);
  const [zoom, setZoom] = useState<ZoomLevel>("standard");
  const [showHistory, setShowHistory] = useState(false);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [dragStart, setDragStart] = useState<{ row: number; day: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextState | null>(null);
  const [editingEntry, setEditingEntry] = useState<PlannerEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const days = useMemo(() => getVisibleDays(new Date()), []);
  const cellWidth = zoomWidths[zoom];

  const visibleEntries = useMemo(() => {
    const filtered = filterEntries(allEntries, filters, showHistory, new Date());
    return sortEntries(filtered);
  }, [allEntries, filters, showHistory]);

  const updateEntry = (updated: PlannerEntry) => {
    setAllEntries((current) => {
      const index = current.findIndex((entry) => entry.id === updated.id);
      if (index === -1) {
        return [...current, updated];
      }

      const next = [...current];
      next[index] = updated;
      return next;
    });
  };

  const selectedStartDay = useMemo(() => {
    if (!selection) return null;
    return days[selection.dayStart] ? toDayKey(days[selection.dayStart]) : null;
  }, [selection, days]);

  const openCreateDialog = (type: PlannerEntry["type"], withSelection = false) => {
    const startDate = withSelection && selectedStartDay ? selectedStartDay : null;
    const endDate = withSelection && selection ? toDayKey(days[selection.dayEnd]) : startDate;

    const blank: PlannerEntry = {
      id: `new-${Date.now()}`,
      tractorId: tractors[0].id,
      type,
      title: `${type} neu`,
      description: "",
      owner: "",
      startDate,
      endDate,
      status: startDate ? "planned" : "unscheduled"
    };

    setEditingEntry(blank);
    setDrawerOpen(true);
  };

  const contextActions = useMemo(() => {
    if (!contextMenu) return [];

    if (contextMenu.entryId) {
      const entry = visibleEntries.find((item) => item.id === contextMenu.entryId);
      if (!entry) return [];

      return [
        { key: "edit", label: "Aktion bearbeiten", onClick: () => { setEditingEntry(entry); setDrawerOpen(true); } },
        {
          key: "confirm",
          label: "Geplante Aktion bestätigen",
          onClick: () => updateEntry({ ...entry, status: "confirmed" })
        },
        {
          key: "moveSelected",
          label: "Auf markiertes Datum verschieben",
          onClick: () => {
            if (!selectedStartDay) return;
            updateEntry(moveEntryToStartDate(entry, selectedStartDay));
          }
        },
        {
          key: "unscheduled",
          label: "Auf unbestimmte Zeit verschieben",
          onClick: () => updateEntry({ ...entry, startDate: null, endDate: null, status: "unscheduled" })
        },
        {
          key: "delete",
          label: "Aktion löschen",
          onClick: () => setAllEntries((current) => current.filter((item) => item.id !== entry.id))
        }
      ];
    }

    return [
      { key: "createAction", label: "Aktion erstellen", onClick: () => openCreateDialog("Umbau") },
      { key: "createEvent", label: "Event erstellen", onClick: () => openCreateDialog("Event") },
      { key: "createTest", label: "Test erstellen", onClick: () => openCreateDialog("Test") },
      { key: "fromSelAction", label: "Neue Aktion aus markiertem Bereich erstellen", onClick: () => openCreateDialog("Umbau", true) },
      { key: "fromSelEvent", label: "Neue Event aus markiertem Bereich erstellen", onClick: () => openCreateDialog("Event", true) },
      { key: "fromSelTest", label: "Neuen Test aus markiertem Bereich erstellen", onClick: () => openCreateDialog("Test", true) }
    ];
  }, [contextMenu, visibleEntries, selectedStartDay, selection, days]);

  const handleSendMail = () => {
    const lines = visibleEntries.map((entry) => `${entry.type}: ${entry.title} | ${entry.owner} | ${entry.startDate ?? "-"} bis ${entry.endDate ?? "-"} | ${entry.status}`);
    const body = encodeURIComponent(`Aktuelle Planungsübersicht\n\n${lines.join("\n")}`);
    window.location.href = `mailto:?subject=Planungsübersicht&body=${body}`;
  };

  return (
    <div className="app-shell">
      <h1>Werkstatt- und Prüfstandsplanung</h1>
      <Toolbar
        zoom={zoom}
        showHistory={showHistory}
        onZoomChange={setZoom}
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        onPrint={() => window.print()}
        onSendMail={handleSendMail}
      />

      <FilterBar
        filters={filters}
        entries={allEntries}
        tractors={tractors}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <Legend />

      <PlannerGrid
        entries={visibleEntries}
        tractors={tractors}
        days={days}
        cellWidth={cellWidth}
        selection={selection}
        onCellMouseDown={(row, day) => {
          setDragStart({ row, day });
          setSelection({ rowStart: row, rowEnd: row, dayStart: day, dayEnd: day });
        }}
        onCellMouseEnter={(row, day) => {
          if (!dragStart) return;
          setSelection({
            rowStart: Math.min(dragStart.row, row),
            rowEnd: Math.max(dragStart.row, row),
            dayStart: Math.min(dragStart.day, day),
            dayEnd: Math.max(dragStart.day, day)
          });
        }}
        onCellMouseUp={() => setDragStart(null)}
        onCellContextMenu={(event, row, day) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY, row, day });
          setSelection({ rowStart: row, rowEnd: row, dayStart: day, dayEnd: day });
        }}
        onTaskMove={(entryId, dayDelta) => {
          setAllEntries((current) => current.map((entry) => (entry.id === entryId ? moveEntryByDays(entry, dayDelta) : entry)));
        }}
        onTaskContextMenu={(event, entryId) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY, entryId });
        }}
      />

      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} actions={contextActions} onClose={() => setContextMenu(null)} />}

      <EditDrawer
        open={drawerOpen}
        tractors={tractors}
        entry={editingEntry}
        onCancel={() => {
          setDrawerOpen(false);
          setEditingEntry(null);
        }}
        onSave={(entry) => {
          updateEntry(entry);
          setDrawerOpen(false);
          setEditingEntry(null);
        }}
      />

      <PrintView entries={visibleEntries} tractors={tractors} />
    </div>
  );
}

export default App;
