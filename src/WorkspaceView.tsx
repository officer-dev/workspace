import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import type { ComponentType } from 'react';
import type { LayoutNode, AppRegistry, DashboardState, EphemeralPanels, PanelComponents } from './types';
import type { DefaultFileSort } from './WorkspaceContext';
import type { EmptyPanelProps } from './PanelSlot';
import type { DropPosition } from './layout-utils';
import { splitPanel, removePanel, setApp, updateSizes, swapPanels, movePanel, countPanels } from './layout-utils';
import { WorkspaceProvider } from './WorkspaceContext';
import { WorkspaceRenderer } from './WorkspaceRenderer';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle, type PanelImperativeHandle } from './ui';

type WorkspaceViewProps = {
  workspace: DashboardState;
  registry: AppRegistry;
  isMobile?: boolean;
  locked?: boolean;
  cwd?: string;
  root?: string;
  initialFilePath?: string;
  defaultFileSort?: DefaultFileSort;
  promptPrefix?: string;
  components?: PanelComponents;
  renderEmpty?: ComponentType<EmptyPanelProps>;
  ephemeral?: EphemeralPanels | null;
  mobilePanelId?: string;
  onMobilePanelChange?: (id: string | null) => void;
};

const noop = () => {};

export const WorkspaceView = ({ workspace, registry, isMobile = false, locked, cwd = '~', root, initialFilePath, defaultFileSort, promptPrefix, components, renderEmpty, ephemeral, mobilePanelId, onMobilePanelChange }: WorkspaceViewProps) => {

  const layout = workspace.value;
  const onLayoutChange = workspace.setValue;
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [maximizedPanelId, setMaximizedPanelId] = useState<string | null>(null);
  const [transitioningPanelId, setTransitioningPanelId] = useState<string | null>(null);

  const setMaximizedAnimated = useCallback((id: string | null) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    const panelId = maximizedPanelId ?? id;
    if (doc.startViewTransition && panelId) {
      setTransitioningPanelId(panelId);
      requestAnimationFrame(() => {
        const transition = doc.startViewTransition(() => flushSync(() => setMaximizedPanelId(id)));
        transition.finished.finally(() => setTransitioningPanelId(null));
      });
    } else {
      setMaximizedPanelId(id);
    }
  }, [maximizedPanelId]);

  const handleSetApp = useCallback(
    (panelId: string, appType: string | null) => {
      onLayoutChange(setApp(layout, panelId, appType));
    },
    [layout, onLayoutChange],
  );

  const handleSplit = useCallback(
    (panelId: string, direction: 'horizontal' | 'vertical') => {
      onLayoutChange(splitPanel(layout, panelId, direction));
    },
    [layout, onLayoutChange],
  );

  const handleRemove = useCallback(
    (panelId: string) => {
      if (countPanels(layout) <= 1) return;
      onLayoutChange(removePanel(layout, panelId));
    },
    [layout, onLayoutChange],
  );

  const handleResized = useCallback(
    (groupId: string, sizes: number[]) => {
      onLayoutChange(updateSizes(layout, groupId, sizes));
    },
    [layout, onLayoutChange],
  );

  const handleSwap = useCallback(
    (sourceId: string, targetId: string) => {
      onLayoutChange(swapPanels(layout, sourceId, targetId));
      setSwapSourceId(null);
    },
    [layout, onLayoutChange],
  );

  const handleMove = useCallback(
    (sourceId: string, targetId: string, position: DropPosition) => {
      onLayoutChange(movePanel(layout, sourceId, targetId, position));
      setDragSourceId(null);
    },
    [layout, onLayoutChange],
  );

  const startDrag = useCallback(
    (id: string | null) => {
      setSwapSourceId(null);
      setDragSourceId(id);
    },
    [],
  );

  useEffect(() => {
    if (!swapSourceId && !dragSourceId && !maximizedPanelId) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setSwapSourceId(null);
        setDragSourceId(null);
        setMaximizedAnimated(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [swapSourceId, dragSourceId, maximizedPanelId, setMaximizedAnimated]);

  const ephemeralPanelRef = useRef<PanelImperativeHandle>(null);
  const isEphemeralOpen = !!ephemeral;

  useEffect(() => {
    const panel = ephemeralPanelRef.current;
    if (!panel) return;

    if (isEphemeralOpen) {
      panel.resize(100 - (ephemeral.defaultBaseSize ?? 40));
    } else {
      panel.collapse();
    }
  }, [isEphemeralOpen, ephemeral?.defaultBaseSize]);

  const onMobileBack = useMemo(() => {
    if (!isMobile) return null;
    if (mobilePanelId && onMobilePanelChange) return () => onMobilePanelChange(null);
    if (isEphemeralOpen && ephemeral?.onClose) return ephemeral.onClose;
    return null;
  }, [isMobile, mobilePanelId, onMobilePanelChange, isEphemeralOpen, ephemeral?.onClose]);

  if (!workspace.isLoaded) return null;

  return (
    <WorkspaceProvider
      value={{
        dashboardId: workspace.key,
        cwd,
        root,
        initialFilePath,
        defaultFileSort,
        promptPrefix,
        swapSourceId,
        setSwapSourceId,
        onSwap: handleSwap,
        dragSourceId,
        setDragSourceId: startDrag,
        onMove: handleMove,
        maximizedPanelId,
        setMaximizedPanelId: setMaximizedAnimated,
        transitioningPanelId,
        isMobile,
        onMobileBack,
      }}
    >
      {isMobile && isEphemeralOpen && ephemeral ? (
        <WorkspaceRenderer
          layout={ephemeral.layout}
          registry={registry}
          components={ephemeral.components}
          isMobile={isMobile}
          onSetApp={noop}
          onSplit={noop}
          onRemove={noop}
          onResized={noop}
        />
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={100} minSize={15}>
            <WorkspaceRenderer
              layout={layout}
              registry={registry}
              components={components}
              renderEmpty={renderEmpty}
              interactive
              locked={locked}
              isMobile={isMobile}
              mobilePanelId={mobilePanelId}
              onSetApp={locked ? noop : handleSetApp}
              onSplit={locked ? noop : handleSplit}
              onRemove={locked ? noop : handleRemove}
              onResized={handleResized}
            />
          </ResizablePanel>
          <ResizableHandle className="bg-transparent after:bg-transparent" disabled={!isEphemeralOpen} />
          <ResizablePanel
            panelRef={ephemeralPanelRef}
            collapsible
            collapsedSize={0}
            defaultSize={0}
            minSize={15}
          >
            {isEphemeralOpen ? (
              <WorkspaceRenderer
                layout={ephemeral.layout}
                registry={registry}
                components={ephemeral.components}
                onSetApp={noop}
                onSplit={noop}
                onRemove={noop}
                onResized={noop}
              />
            ) : null}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </WorkspaceProvider>
  );
};
