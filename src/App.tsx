import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addWeeks } from "date-fns";
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
import {
  filterEntries,
  moveEntryByDays,
  moveEntryToStartDate,
  moveMultipleEntriesToStartDate,
  sortEntries
} from "./utils/planner";
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
  rowEntryId?: string; // entry in the row where right-click happened on an empty cell
  row?: number;
  day?: number;
}

function App() {
  const [allEntries, setAllEntries] = useState<PlannerEntry[]>(fakeEntries);
  const [filters, setFilters] = useState<PlannerFilters>(defaultFilters);
  const [zoom, setZoom] = useState<ZoomLevel>("standard");
  const [showHistory, setShowHistory] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [dragStart, setDragStart] = useState<{ row: number; day: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextState | null>(null);
  const [editingEntry, setEditingEntry] = useState<PlannerEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(
    () => getVisibleDays(addWeeks(new Date(), weekOffset)),
    [weekOffset]
  );
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

  // Navigate to today and scroll today column into view
  const handleToday = useCallback(() => {
    setWeekOffset(0);
    // Scroll so today is visible — happens after render
    setTimeout(() => {
      if (!gridRef.current) return;
      const today = new Date();
      const baseEntry = days[0];
      const diff = Math.round((today.getTime() - baseEntry.getTime()) / 86400000);
      const todayPx = diff * cellWidth;
      gridRef.current.scrollLeft = Math.max(0, todayPx - gridRef.current.clientWidth / 2);
    }, 50);
  }, [days, cellWidth]);

  // Keyboard navigation: ArrowLeft / ArrowRight to scroll; Shift+Arrow for week navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (drawerOpen || contextMenu) return;
      if (e.key === "ArrowLeft") {
        if (e.shiftKey) {
          setWeekOffset((prev) => prev - 1);
        } else if (gridRef.current) {
          gridRef.current.scrollLeft -= cellWidth * 7;
        }
      } else if (e.key === "ArrowRight") {
        if (e.shiftKey) {
          setWeekOffset((prev) => prev + 1);
        } else if (gridRef.current) {
          gridRef.current.scrollLeft += cellWidth * 7;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, contextMenu, cellWidth]);

  // Shift+Wheel for horizontal scrolling.
  // gridRef.current is null until the grid mounts; the dependency on .current
  // ensures the listener is attached on the first render where the element exists.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [gridRef.current]);

  const openCreateDialog = (type: PlannerEntry["type"], withSelection = false, tractorId?: string) => {
    const startDate = withSelection && selectedStartDay ? selectedStartDay : null;
    const endDate = withSelection && selection ? toDayKey(days[selection.dayEnd]) : startDate;

    const blank: PlannerEntry = {
      id: `new-${Date.now()}`,
      tractorId: tractorId ?? tractors[0].id,
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

  // Collect all selected entry ids (entries whose rows fall in the selection)
  const selectedEntryIds = useMemo(() => {
    if (!selection) return [];
    // Build sorted visible entries same as in PlannerGrid
    const groups = tractors
      .map((tractor) => ({
        tractor,
        entries: visibleEntries.filter((e) => e.tractorId === tractor.id)
      }))
      .filter((g) => g.entries.length > 0);

    const rowMap: Array<{ entry: PlannerEntry; rowIndex: number }> = [];
    let idx = 0;
    groups.forEach(({ entries }) => {
      entries.forEach((entry) => {
        rowMap.push({ entry, rowIndex: idx++ });
      });
    });

    return rowMap
      .filter(({ rowIndex }) => rowIndex >= selection.rowStart && rowIndex <= selection.rowEnd)
      .map(({ entry }) => entry.id);
  }, [selection, visibleEntries]);

  const contextActions = useMemo(() => {
    if (!contextMenu) return [];

    const targetEntryId = contextMenu.entryId ?? contextMenu.rowEntryId;
    if (targetEntryId) {
      const entry = allEntries.find((item) => item.id === targetEntryId);
      if (!entry) return [];

      const actions = [
        {
          key: "edit",
          label: "✏️ Aktion bearbeiten",
          onClick: () => { setEditingEntry(entry); setDrawerOpen(true); }
        },
        {
          key: "confirm",
          label: "✅ Geplante Aktion bestätigen",
          onClick: () => updateEntry({ ...entry, status: "confirmed" })
        },
        {
          key: "moveSelected",
          label: "📅 Auf markiertes Datum verschieben",
          onClick: () => {
            if (!selectedStartDay) return;
            updateEntry(moveEntryToStartDate(entry, selectedStartDay));
          }
        },
        {
          key: "unscheduled",
          label: "⏸️ Auf unbestimmte Zeit verschieben",
          onClick: () => updateEntry({ ...entry, startDate: null, endDate: null, status: "unscheduled" })
        },
        {
          key: "delete",
          label: "🗑️ Aktion löschen",
          onClick: () => setAllEntries((current) => current.filter((item) => item.id !== entry.id))
        }
      ];

      // If multiple rows selected, offer bulk move
      if (selectedEntryIds.length > 1 && selectedStartDay) {
        actions.push({
          key: "moveBulk",
          label: `📦 ${selectedEntryIds.length} markierte Tasks auf Startdatum verschieben`,
          onClick: () => {
            setAllEntries((current) => moveMultipleEntriesToStartDate(current, selectedEntryIds, selectedStartDay));
          }
        });
      }

      return actions;
    }

    // Cell right-click (no entry) – general create menu
    const tractorId = contextMenu.row !== undefined
      ? (() => {
          const groups = tractors
            .map((t) => ({ t, entries: visibleEntries.filter((e) => e.tractorId === t.id) }))
            .filter((g) => g.entries.length > 0);
          let idx = 0;
          for (const g of groups) {
            for (const e of g.entries) {
              if (idx === contextMenu.row) return e.tractorId;
              idx++;
            }
          }
          return undefined;
        })()
      : undefined;

    const createActions = [
      { key: "createAction",    label: "➕ Aktion erstellen",                              onClick: () => openCreateDialog("Umbau", false, tractorId) },
      { key: "createEvent",     label: "➕ Event erstellen",                               onClick: () => openCreateDialog("Event", false, tractorId) },
      { key: "createTest",      label: "➕ Test erstellen",                                onClick: () => openCreateDialog("Test", false, tractorId) },
      { key: "fromSelAction",   label: "📐 Neue Aktion aus markiertem Bereich",            onClick: () => openCreateDialog("Umbau", true, tractorId) },
      { key: "fromSelEvent",    label: "📐 Neues Event aus markiertem Bereich",            onClick: () => openCreateDialog("Event", true, tractorId) },
      { key: "fromSelTest",     label: "📐 Neuen Test aus markiertem Bereich",             onClick: () => openCreateDialog("Test", true, tractorId) }
    ];

    // If multiple rows selected offer bulk move too
    if (selectedEntryIds.length > 1 && selectedStartDay) {
      createActions.push({
        key: "moveBulk",
        label: `📦 ${selectedEntryIds.length} markierte Tasks auf Startdatum verschieben`,
        onClick: () => {
          setAllEntries((current) => moveMultipleEntriesToStartDate(current, selectedEntryIds, selectedStartDay));
        }
      });
    }

    return createActions;
  }, [contextMenu, allEntries, visibleEntries, selectedStartDay, selection, days, selectedEntryIds, tractors]);

  const handleSendMail = () => {
    const lines = visibleEntries.map((entry) => {
      const range = `${entry.startDate ?? "-"} bis ${entry.endDate ?? "-"}`;
      return `${entry.type}: ${entry.title} | ${entry.owner} | ${range} | ${entry.status}`;
    });
    const body = encodeURIComponent(`Aktuelle Planungsübersicht\n\n${lines.join("\n")}`);
    window.location.href = `mailto:?subject=Planungsübersicht&body=${body}`;
  };

  return (
    <div className="app-shell">
      <h1>Werkstatt- und Prüfstandsplanung</h1>
      <Toolbar
        zoom={zoom}
        showHistory={showHistory}
        weekOffset={weekOffset}
        onZoomChange={setZoom}
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        onPrint={() => window.print()}
        onSendMail={handleSendMail}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        onToday={handleToday}
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
        isSelecting={isSelecting}
        gridRef={gridRef}
        onCellMouseDown={(row, day) => {
          setDragStart({ row, day });
          setIsSelecting(true);
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
        onCellMouseUp={() => {
          setDragStart(null);
          setIsSelecting(false);
        }}
        onCellContextMenu={(event, row, day, entryId) => {
          event.preventDefault();
          // Set selection to clicked cell if no multi-selection active
          if (!selection || (selection.rowStart === selection.rowEnd && selection.dayStart === selection.dayEnd)) {
            setSelection({ rowStart: row, rowEnd: row, dayStart: day, dayEnd: day });
          }
          setContextMenu({ x: event.clientX, y: event.clientY, row, day, rowEntryId: entryId });
        }}
        onTaskMove={(entryId, dayDelta) => {
          setAllEntries((current) =>
            current.map((entry) => (entry.id === entryId ? moveEntryByDays(entry, dayDelta) : entry))
          );
        }}
        onTaskContextMenu={(event, entryId) => {
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY, entryId });
        }}
        onDescriptionEdit={(entryId, newDescription) => {
          setAllEntries((current) =>
            current.map((entry) => (entry.id === entryId ? { ...entry, description: newDescription } : entry))
          );
        }}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={contextActions}
          onClose={() => setContextMenu(null)}
        />
      )}

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
