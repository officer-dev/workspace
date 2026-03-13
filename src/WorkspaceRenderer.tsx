import { useCallback, useRef } from 'react';
import type { ComponentType } from 'react';
import type { LayoutNode, AppRegistry, PanelComponents } from './types';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from './ui';
import { countPanels } from './layout-utils';
import { PanelSlot, type EmptyPanelProps } from './PanelSlot';

type WorkspaceRendererProps = {
  layout: LayoutNode;
  registry: AppRegistry;
  components?: PanelComponents;
  renderEmpty?: ComponentType<EmptyPanelProps>;
  interactive?: boolean;
  locked?: boolean;
  noHeader?: boolean;
  isMobile?: boolean;
  mobilePanelId?: string;
  onSetApp: (panelId: string, appType: string | null) => void;
  onSplit: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onRemove: (panelId: string) => void;
  onResized: (groupId: string, sizes: number[]) => void;
};

export const WorkspaceRenderer = ({
  layout,
  registry,
  components,
  renderEmpty,
  interactive = false,
  locked = false,
  noHeader = false,
  isMobile = false,
  mobilePanelId,
  onSetApp,
  onSplit,
  onRemove,
  onResized,
}: WorkspaceRendererProps) => {
  const totalPanels = countPanels(layout);

  return (
    <div className="h-full w-full">
      <LayoutNodeRenderer
        node={layout}
        registry={registry}
        components={components}
        renderEmpty={renderEmpty}
        interactive={interactive}
        locked={locked}
        noHeader={noHeader}
        isMobile={isMobile}
        mobilePanelId={mobilePanelId}
        totalPanels={totalPanels}
        onSetApp={onSetApp}
        onSplit={onSplit}
        onRemove={onRemove}
        onResized={onResized}
      />
    </div>
  );
};

type LayoutNodeRendererProps = {
  node: LayoutNode;
  registry: AppRegistry;
  components?: PanelComponents;
  renderEmpty?: ComponentType<EmptyPanelProps>;
  interactive: boolean;
  locked: boolean;
  noHeader: boolean;
  isMobile: boolean;
  mobilePanelId?: string;
  totalPanels: number;
  onSetApp: (panelId: string, appType: string | null) => void;
  onSplit: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onRemove: (panelId: string) => void;
  onResized: (groupId: string, sizes: number[]) => void;
};

const getFixedHeight = (node: LayoutNode, registry: AppRegistry): number | undefined => {
  if (node.type === 'panel' && node.appType) return registry[node.appType]?.fixedHeight;
  return undefined;
};

/** Find a panel node by id anywhere in the layout tree */
const findChildById = (children: { node: LayoutNode; size: number }[], id: string): { node: LayoutNode; size: number } | undefined => {
  for (const child of children) {
    if (child.node.id === id) return child;
    if (child.node.type === 'panel' && child.node.id === id) return child;
    if (child.node.type === 'group') {
      const found = findChildById(child.node.children, id);
      if (found) return child;
    }
  }
  return undefined;
};

const LayoutNodeRenderer = ({
  node,
  registry,
  components,
  renderEmpty,
  interactive,
  locked,
  noHeader,
  isMobile,
  mobilePanelId,
  totalPanels,
  onSetApp,
  onSplit,
  onRemove,
  onResized,
}: LayoutNodeRendererProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mountedRef = useRef(false);

  const handleLayout = useCallback(
    (layout: Record<string, number>) => {
      if (node.type !== 'group') return;
      if (!mountedRef.current) {
        mountedRef.current = true;
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const sizes = node.children.map((child) => layout[child.node.id] ?? child.size);
        onResized(node.id, sizes);
      }, 500);
    },
    [node, onResized],
  );

  if (node.type === 'panel') {
    return (
      <PanelSlot
        panel={node}
        registry={registry}
        components={components}
        renderEmpty={renderEmpty}
        interactive={interactive}
        locked={locked}
        noHeader={noHeader}
        isLastPanel={totalPanels <= 1}
        onSetApp={onSetApp}
        onSplit={onSplit}
        onRemove={onRemove}
      />
    );
  }

  // Mobile: render only one panel at a time for horizontal groups
  if (isMobile && node.direction === 'horizontal' && node.children.length > 1) {
    const activeChild = (mobilePanelId && findChildById(node.children, mobilePanelId)) || node.children[0]!;
    return (
      <div className="h-full w-full">
        <LayoutNodeRenderer
          node={activeChild.node}
          registry={registry}
          components={components}
          renderEmpty={renderEmpty}
          interactive={interactive}
          locked={locked}
          noHeader={noHeader}
          isMobile={isMobile}
          mobilePanelId={mobilePanelId}
          totalPanels={totalPanels}
          onSetApp={onSetApp}
          onSplit={onSplit}
          onRemove={onRemove}
          onResized={onResized}
        />
      </div>
    );
  }

  const hasFixedChild =
    node.direction === 'vertical' &&
    node.children.some((c) => getFixedHeight(c.node, registry) !== undefined || (c.node.type === 'panel' && c.node.fitContent));

  if (hasFixedChild) {
    return (
      <div className="flex h-full w-full flex-col">
        {node.children.map((child) => {
          const fixed = getFixedHeight(child.node, registry);
          const fit = child.node.type === 'panel' && child.node.fitContent;
          return (
            <div key={child.node.id} className={fixed !== undefined || fit ? 'shrink-0' : 'min-h-0 flex-1'} style={fixed !== undefined ? { height: fixed } : undefined}>
              <LayoutNodeRenderer
                node={child.node}
                registry={registry}
                components={components}
                renderEmpty={renderEmpty}
                interactive={interactive}
                locked={locked}
                noHeader={noHeader}
                isMobile={isMobile}
                mobilePanelId={mobilePanelId}
                totalPanels={totalPanels}
                onSetApp={onSetApp}
                onSplit={onSplit}
                onRemove={onRemove}
                onResized={onResized}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ResizablePanelGroup id={node.id} orientation={node.direction} onLayoutChange={handleLayout} className="h-full w-full">
      {node.children.map((child, i) => (
        <ChildEntry key={child.node.id} index={i} total={node.children.length}>
          <ResizablePanel id={child.node.id} defaultSize={child.size} minSize={5}>
            <div className="h-full w-full">
              <LayoutNodeRenderer
                node={child.node}
                registry={registry}
                components={components}
                renderEmpty={renderEmpty}
                interactive={interactive}
                locked={locked}
                noHeader={noHeader}
                isMobile={isMobile}
                mobilePanelId={mobilePanelId}
                totalPanels={totalPanels}
                onSetApp={onSetApp}
                onSplit={onSplit}
                onRemove={onRemove}
                onResized={onResized}
              />
            </div>
          </ResizablePanel>
        </ChildEntry>
      ))}
    </ResizablePanelGroup>
  );
};

type ChildEntryProps = {
  index: number;
  total: number;
  children: React.ReactNode;
};

const ChildEntry = ({ index, total, children }: ChildEntryProps) => {
  if (index === 0) return <>{children}</>;
  return (
    <>
      <ResizableHandle className="bg-transparent after:bg-transparent" />
      {children}
    </>
  );
};
