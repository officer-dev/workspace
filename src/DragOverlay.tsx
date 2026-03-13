import { useCallback, useEffect, useRef, useState } from 'react';
import type { DropPosition } from './layout-utils';
import { useWorkspace } from './WorkspaceContext';

type DropTarget = {
  panelId: string;
  zone: DropPosition;
  rect: DOMRect;
};

function getDropZone(rect: DOMRect, x: number, y: number): DropPosition {
  const fx = (x - rect.left) / rect.width;
  const fy = (y - rect.top) / rect.height;

  if (fx > 0.3 && fx < 0.7 && fy > 0.3 && fy < 0.7) return 'center';

  const edges: [DropPosition, number][] = [
    ['left', fx],
    ['right', 1 - fx],
    ['top', fy],
    ['bottom', 1 - fy],
  ];

  return edges.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
}

function getIndicatorStyle(rect: DOMRect, zone: DropPosition): React.CSSProperties {
  switch (zone) {
    case 'center':
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    case 'top':
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height / 2 };
    case 'bottom':
      return { left: rect.left, top: rect.top + rect.height / 2, width: rect.width, height: rect.height / 2 };
    case 'left':
      return { left: rect.left, top: rect.top, width: rect.width / 2, height: rect.height };
    case 'right':
      return { left: rect.left + rect.width / 2, top: rect.top, width: rect.width / 2, height: rect.height };
  }
}

export const DragOverlay = () => {
  const { dragSourceId, setDragSourceId, onMove } = useWorkspace();
  const [target, setTarget] = useState<DropTarget | null>(null);
  const panelRectsRef = useRef<Map<string, DOMRect>>(new Map());

  useEffect(() => {
    if (!dragSourceId) {
      panelRectsRef.current.clear();
      setTarget(null);
      return;
    }
    const panels = document.querySelectorAll<HTMLElement>('[data-panel-id]');
    const map = new Map<string, DOMRect>();
    panels.forEach((el) => {
      const id = el.dataset.panelId!;
      if (id !== dragSourceId) map.set(id, el.getBoundingClientRect());
    });
    panelRectsRef.current = map;
  }, [dragSourceId]);

  const handlePointerMove = useCallback((ev: React.PointerEvent) => {
    const { clientX: x, clientY: y } = ev;
    let found: DropTarget | null = null;

    for (const [panelId, rect] of panelRectsRef.current) {
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        found = { panelId, zone: getDropZone(rect, x, y), rect };
        break;
      }
    }

    setTarget(found);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (dragSourceId && target) {
      onMove(dragSourceId, target.panelId, target.zone);
    }
    setDragSourceId(null);
  }, [dragSourceId, target, onMove, setDragSourceId]);

  if (!dragSourceId) return null;

  return (
    <div
      className="fixed inset-0 z-50 cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {target && (
        <div
          className="absolute rounded-lg border-2 border-interactive/60 bg-interactive/15 pointer-events-none"
          style={{ ...getIndicatorStyle(target.rect, target.zone), transition: 'all 75ms ease-out' }}
        />
      )}
    </div>
  );
};
