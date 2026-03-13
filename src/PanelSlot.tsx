import type { ComponentType } from 'react';
import { useCallback } from 'react';
import { ArrowLeftRight, ChevronLeft, X, Minus } from 'lucide-react';
import type { LayoutPanel, AppRegistry, PanelComponents, PanelComponentEntry } from './types';
import { useWorkspace } from './WorkspaceContext';
import { Card, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from './ui';
export type EmptyPanelProps = {
  panelId: string;
  registry: AppRegistry;
  onSelect: (appType: string) => void;
};

type PanelSlotProps = {
  panel: LayoutPanel;
  registry: AppRegistry;
  components?: PanelComponents;
  renderEmpty?: ComponentType<EmptyPanelProps>;
  interactive: boolean;
  locked: boolean;
  noHeader: boolean;
  isLastPanel: boolean;
  onSetApp: (panelId: string, appType: string | null) => void;
  onSplit: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onRemove: (panelId: string) => void;
};

type PanelContextMenuProps = {
  panelId: string;
  hasApp: boolean;
  isLastPanel: boolean;
  onSplit: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onRemove: (panelId: string) => void;
  onClearApp: () => void;
  children: React.ReactNode;
};

const isPanelEntry = (v: ComponentType | PanelComponentEntry): v is PanelComponentEntry =>
  typeof v === 'object' && v !== null && 'component' in v;

const PanelContextMenu = ({ panelId, hasApp, isLastPanel, onSplit, onRemove, onClearApp, children }: PanelContextMenuProps) => {
  const { swapSourceId, setSwapSourceId, maximizedPanelId, setMaximizedPanelId } = useWorkspace();
  const isMaximized = maximizedPanelId === panelId;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setMaximizedPanelId(isMaximized ? null : panelId)}>
          {isMaximized ? 'Restore' : 'Maximize'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onSplit(panelId, 'horizontal')}>Split horizontal</ContextMenuItem>
        <ContextMenuItem onClick={() => onSplit(panelId, 'vertical')}>Split vertical</ContextMenuItem>
        {hasApp && <ContextMenuItem onClick={onClearApp}>Clear app</ContextMenuItem>}
        {!isLastPanel && (
          <ContextMenuItem className="text-red-500 focus:text-red-500" onClick={() => onRemove(panelId)}>
            Remove panel
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {swapSourceId ? (
          <ContextMenuItem onClick={() => setSwapSourceId(null)}>Cancel swap</ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={() => setSwapSourceId(panelId)}>Swap with...</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

const SwapOverlay = ({ panelId }: { panelId: string }) => {
  const { swapSourceId, onSwap } = useWorkspace();

  if (!swapSourceId || swapSourceId === panelId) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-interactive/10 hover:bg-interactive/20 transition-colors cursor-pointer"
      onClick={() => onSwap(swapSourceId, panelId)}
    >
      <div className="flex items-center gap-2 rounded-md bg-background/90 backdrop-blur-sm px-3 py-2 shadow-lg border border-interactive/30">
        <ArrowLeftRight className="h-4 w-4 text-interactive" />
        <span className="text-sm font-medium text-interactive">Swap here</span>
      </div>
    </div>
  );
};

const SwapSourceIndicator = ({ panelId }: { panelId: string }) => {
  const { swapSourceId, setSwapSourceId } = useWorkspace();

  if (swapSourceId !== panelId) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none ring-2 ring-inset ring-interactive/50 rounded-md">
      <div className="absolute top-2 left-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => setSwapSourceId(null)}
          className="flex items-center gap-1.5 rounded-md bg-interactive/90 px-2.5 py-1 text-xs font-medium text-white shadow cursor-pointer hover:bg-interactive"
        >
          <ArrowLeftRight className="h-3 w-3" />
          Swapping... click to cancel
        </button>
      </div>
    </div>
  );
};

const TrafficLights = ({ panelId, isLastPanel, onRemove, onClearApp }: { panelId: string; isLastPanel: boolean; onRemove: (panelId: string) => void; onClearApp: () => void }) => {
  const { maximizedPanelId, setMaximizedPanelId } = useWorkspace();
  const isMaximized = maximizedPanelId === panelId;

  const handleClose = useCallback(() => {
    onClearApp();
  }, [onClearApp]);

  const handleRestore = useCallback(() => {
    setMaximizedPanelId(null);
  }, [setMaximizedPanelId]);

  const handleMaximize = useCallback(() => {
    setMaximizedPanelId(panelId);
  }, [panelId, setMaximizedPanelId]);

  if (isMaximized) {
    return (
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <button
          type="button"
          onClick={handleRestore}
          className="group/btn h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center"
          title="Restore"
        >
          <Minus className="h-2 w-2 text-[#5f4a00] opacity-0 group-hover/btn:opacity-100 transition-opacity" strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
      <button
        type="button"
        onClick={handleClose}
        className="group/btn h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center"
        title={isLastPanel ? 'Clear app' : 'Close panel'}
      >
        <X className="h-2 w-2 text-[#4a0002] opacity-0 group-hover/btn:opacity-100 transition-opacity" strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={handleMaximize}
        className="group/btn h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center"
        title="Maximize"
      >
        <svg viewBox="0 0 10 10" className="h-1.5 w-1.5 text-[#006500] opacity-0 group-hover/btn:opacity-100 transition-opacity">
          <path d="M0 3.5L5 0L10 3.5V10H0Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};

const MaximizeButton = ({ panelId }: { panelId: string }) => {
  const { maximizedPanelId, setMaximizedPanelId } = useWorkspace();
  const isMaximized = maximizedPanelId === panelId;

  return (
    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
      <button
        type="button"
        onClick={() => setMaximizedPanelId(isMaximized ? null : panelId)}
        className="group/btn h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center"
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <Minus className="h-2 w-2 text-[#006500] opacity-0 group-hover/btn:opacity-100 transition-opacity" strokeWidth={3} />
        ) : (
          <svg viewBox="0 0 10 10" className="h-1.5 w-1.5 text-[#006500] opacity-0 group-hover/btn:opacity-100 transition-opacity">
            <path d="M0 3.5L5 0L10 3.5V10H0Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};

const MaximizeContextMenu = ({ panelId, children }: { panelId: string; children: React.ReactNode }) => {
  const { maximizedPanelId, setMaximizedPanelId } = useWorkspace();
  const isMaximized = maximizedPanelId === panelId;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setMaximizedPanelId(isMaximized ? null : panelId)}>
          {isMaximized ? 'Restore' : 'Maximize'}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// TODO: drag-to-reposition needs work (visual feedback, edge cases)
// const DragHandle = ({ panelId }: { panelId: string }) => {
//   const { setDragSourceId, dragSourceId } = useWorkspace();
//   const onPointerDown = useCallback((ev: React.PointerEvent) => { ev.preventDefault(); setDragSourceId(panelId); }, [panelId, setDragSourceId]);
//   if (dragSourceId) return null;
//   return (
//     <div className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-interactive/5 text-interactive/30 opacity-0 group-hover/panel:opacity-100 hover:!bg-interactive/10 hover:!text-interactive/60 transition-all cursor-grab" onPointerDown={onPointerDown}>
//       <GripVertical className="h-5 w-5" />
//     </div>
//   );
// };
//
// const DragSourceDimmer = ({ panelId }: { panelId: string }) => {
//   const { dragSourceId } = useWorkspace();
//   if (dragSourceId !== panelId) return null;
//   return <div className="absolute inset-0 z-20 rounded-md bg-interactive/10 pointer-events-none" />;
// };

export const PanelSlot = ({ panel, registry, components, renderEmpty: RenderEmpty, interactive, locked, noHeader, isLastPanel, onSetApp, onSplit, onRemove }: PanelSlotProps) => {
  const { maximizedPanelId, transitioningPanelId, isMobile, onMobileBack } = useWorkspace();
  const isMaximized = maximizedPanelId === panel.id;

  const rawPanelComponent = components?.[panel.id];
  const panelEntry = rawPanelComponent && isPanelEntry(rawPanelComponent) ? rawPanelComponent : null;
  const PanelComponent = panelEntry ? panelEntry.component : (rawPanelComponent as ComponentType | undefined);

  const entry = panel.appType ? registry[panel.appType] : null;
  const AppComponent = PanelComponent ?? entry?.component;

  // Resolve header, provider, onClose from PanelComponentEntry or registry
  const HeaderComponent = panelEntry?.header ?? entry?.header;
  const ProviderComponent = panelEntry?.provider ?? entry?.provider;
  const onClose = panelEntry?.onClose;

  const contextMenu = interactive
    ? locked
      ? (content: React.ReactNode) => (
          <MaximizeContextMenu panelId={panel.id}>{content}</MaximizeContextMenu>
        )
      : (content: React.ReactNode) => (
          <PanelContextMenu panelId={panel.id} hasApp={!!AppComponent} isLastPanel={isLastPanel} onSplit={onSplit} onRemove={onRemove} onClearApp={() => onSetApp(panel.id, null)}>
            {content}
          </PanelContextMenu>
        )
    : (content: React.ReactNode) => <>{content}</>;

  const overlays = interactive && !locked ? (
    <>
      <SwapOverlay panelId={panel.id} />
      <SwapSourceIndicator panelId={panel.id} />
    </>
  ) : null;

  if (!AppComponent) {
    if (!interactive || locked) {
      return (
        <div className="h-full w-full p-1">
          <div className="h-full w-full rounded-md border border-interactive/50" />
        </div>
      );
    }

    return contextMenu(
      <div data-panel-id={panel.id} className="group/panel relative h-full w-full p-1">
        <Card className="relative h-full w-full flex flex-col items-center justify-center gap-3 p-4">
          {RenderEmpty ? <RenderEmpty panelId={panel.id} registry={registry} onSelect={(type) => onSetApp(panel.id, type)} /> : null}
        </Card>
        {overlays}
      </div>,
    );
  }

  if (entry?.transparent) {
    return contextMenu(
      <div data-panel-id={panel.id} className="group/panel relative h-full w-full p-1">
        <div className="relative h-full w-full overflow-hidden">
          <AppComponent panelId={panel.id} />
        </div>
        {overlays}
      </div>,
    );
  }

  // All apps get a chrome header — custom HeaderComponent or default from registry icon+name
  const DefaultHeader = entry ? () => (
    <>
      <entry.icon className="h-3.5 w-3.5 shrink-0" />
      <span className="text-xs font-medium truncate flex-1">{entry.name}</span>
    </>
  ) : null;

  const ResolvedHeader = HeaderComponent ?? DefaultHeader;

  const trafficLights = interactive && !isMobile && !panel.fitContent ? (
    locked ? (
      <MaximizeButton panelId={panel.id} />
    ) : (
      <TrafficLights panelId={panel.id} isLastPanel={isLastPanel} onRemove={onRemove} onClearApp={() => onSetApp(panel.id, null)} />
    )
  ) : null;

  const mobileBackButton = isMobile && onMobileBack ? (
    <button
      type="button"
      onClick={onMobileBack}
      className="flex items-center gap-0.5 text-xs font-medium text-black/70 hover:text-black transition-colors cursor-pointer shrink-0"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>
  ) : null;

  const headerContent = (
    <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-black/10 text-black font-semibold">
      {mobileBackButton}
      {ResolvedHeader && <ResolvedHeader panelId={panel.id} />}
      {!mobileBackButton && onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {trafficLights}
    </div>
  );

  const headerBar = interactive ? (
    locked ? (
      <MaximizeContextMenu panelId={panel.id}>{headerContent}</MaximizeContextMenu>
    ) : (
      <PanelContextMenu panelId={panel.id} hasApp={!!AppComponent} isLastPanel={isLastPanel} onSplit={onSplit} onRemove={onRemove} onClearApp={() => onSetApp(panel.id, null)}>
        {headerContent}
      </PanelContextMenu>
    )
  ) : headerContent;

  const body = (
    <div className="flex-1 min-h-0">
      <Card className="h-full w-full overflow-hidden p-0 rounded-none border-0 shadow-none">
        <AppComponent panelId={panel.id} />
      </Card>
    </div>
  );

  const inner = ProviderComponent ? (
    <ProviderComponent panelId={panel.id}>
      {!noHeader && headerBar}
      {body}
    </ProviderComponent>
  ) : (
    <>
      {!noHeader && headerBar}
      {body}
    </>
  );

  const transitionStyle = transitioningPanelId === panel.id ? { viewTransitionName: `panel-${panel.id}` } as React.CSSProperties : undefined;
  const fit = panel.fitContent;

  return (
    <div data-panel-id={panel.id} className={isMaximized ? 'fixed inset-0 z-50 p-2 bg-background' : `group/panel relative ${fit ? '' : 'h-full '}w-full p-1`}>
      <div
        className={`relative ${fit ? '' : 'h-full '}w-full overflow-hidden rounded-md border border-border bg-card p-2 flex flex-col${isMaximized ? ' shadow-2xl bg-background' : ''}`}
        style={transitionStyle}
      >
        {inner}
      </div>
      {!isMaximized && overlays}
    </div>
  );
};
