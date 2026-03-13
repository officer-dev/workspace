import { useCallback } from 'react';
import type { ComponentType } from 'react';
import type { LayoutNode, AppRegistry, PanelComponents } from './types';
import type { EmptyPanelProps } from './PanelSlot';
import { updateSizes } from './layout-utils';
import { WorkspaceProvider } from './WorkspaceContext';
import { WorkspaceRenderer } from './WorkspaceRenderer';

type WorkspaceLayoutProps = {
  layout: LayoutNode;
  onLayoutChange: (layout: LayoutNode) => void;
  registry?: AppRegistry;
  components?: PanelComponents;
  renderEmpty?: ComponentType<EmptyPanelProps>;
  dashboardId?: string;
  cwd?: string;
  promptPrefix?: string;
  noHeader?: boolean;
  isMobile?: boolean;
  mobilePanelId?: string;
  onMobileBack?: (() => void) | null;
};

const noop = () => {};

export const WorkspaceLayout = ({ layout, onLayoutChange, registry = {}, components, renderEmpty, dashboardId, cwd, promptPrefix, noHeader, isMobile, mobilePanelId, onMobileBack }: WorkspaceLayoutProps) => {

  const handleResized = useCallback(
    (groupId: string, sizes: number[]) => {
      onLayoutChange(updateSizes(layout, groupId, sizes));
    },
    [layout, onLayoutChange],
  );

  return (
    <WorkspaceProvider value={{ dashboardId: dashboardId ?? null, cwd: cwd ?? '~', promptPrefix, swapSourceId: null, setSwapSourceId: noop, onSwap: noop, dragSourceId: null, setDragSourceId: noop, onMove: noop, maximizedPanelId: null, setMaximizedPanelId: noop, transitioningPanelId: null, isMobile: isMobile ?? false, onMobileBack: onMobileBack ?? null }}>
      <WorkspaceRenderer
        layout={layout}
        registry={registry}
        components={components}
        renderEmpty={renderEmpty}
        noHeader={noHeader}
        isMobile={isMobile}
        mobilePanelId={mobilePanelId}
        onSetApp={noop}
        onSplit={noop}
        onRemove={noop}
        onResized={handleResized}
      />
    </WorkspaceProvider>
  );
};
