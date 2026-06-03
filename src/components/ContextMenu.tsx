import { useEffect, useRef } from "react";

export interface ContextAction {
  key: string;
  label: string;
  separator?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextAction[];
  onClose: () => void;
}

export const ContextMenu = ({ x, y, actions, onClose }: ContextMenuProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  return (
    <div className="context-menu" style={{ left: x, top: y }} ref={ref}>
      {actions.map((action) =>
        action.separator ? (
          <div key={action.key} className="context-menu-separator" role="separator" />
        ) : (
          <button
            key={action.key}
            type="button"
            onClick={() => {
              action.onClick();
              onClose();
            }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
};
