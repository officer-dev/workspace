# @officerdev/workspace

A flexible, resizable panel layout system for React — split, drag, swap, and maximize panels in a tree-based workspace.

## Install

```bash
npm install @officerdev/workspace
```

## Quick Start

```tsx
import { WorkspaceView, createDefaultLayout, splitPanel, setApp } from '@officerdev/workspace';
import type { AppRegistry, LayoutNode } from '@officerdev/workspace';
import { FileText, Terminal } from 'lucide-react';
import { useState } from 'react';

const registry: AppRegistry = {
  notes: {
    name: 'Notes',
    icon: FileText,
    component: () => <div className="p-4">My notes panel</div>,
  },
  terminal: {
    name: 'Terminal',
    icon: Terminal,
    component: () => <div className="p-4 font-mono">$ hello</div>,
  },
};

function App() {
  const [layout, setLayout] = useState<LayoutNode>(() => {
    let l: LayoutNode = createDefaultLayout();
    l = splitPanel(l, l.id, 'horizontal');
    if (l.type === 'group') {
      const [first, second] = l.children;
      l = setApp(l, first!.node.id, 'notes');
      l = setApp(l, second!.node.id, 'terminal');
    }
    return l;
  });

  return (
    <WorkspaceView
      workspace={{ key: 'demo', value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
    />
  );
}
```

## Examples

The `example/` directory contains a full working app with multiple layout demos:

```bash
bun run example
# opens at http://localhost:3001
```

| Page | Description |
|------|-------------|
| **Split** | Two panels side by side |
| **Triple** | Sidebar + stacked panels on the right |
| **Grid** | 2x2 grid with four different apps |
| **Task** | `fitContent` status bar + steps/terminal below |
| **Banner** | `fitContent` info banner + overview/notes/chat |
| **Read-only** | `WorkspaceLayout` with `noHeader`, no interactions |
| **Empty** | Single empty panel with a custom `renderEmpty` picker |

Each demo is in its own file under `example/pages/` for easy reference.

## API Reference

### `WorkspaceView`

Full-featured workspace with split/remove/swap/drag/maximize support, ephemeral side panels, and mobile handling.

```tsx
<WorkspaceView
  workspace={dashboardState}
  registry={appRegistry}
  renderEmpty={MyEmptyPanel}
  isMobile={false}
  locked={false}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workspace` | `DashboardState` | — | Layout state object with `key`, `value`, `setValue`, and `isLoaded` |
| `registry` | `AppRegistry` | — | Map of app type keys to their component definitions |
| `renderEmpty` | `ComponentType<EmptyPanelProps>` | `undefined` | Custom component rendered in empty panels (no app assigned) |
| `isMobile` | `boolean` | `false` | Enable mobile single-panel mode |
| `locked` | `boolean` | `undefined` | Disable split/remove/setApp interactions |
| `cwd` | `string` | `'~'` | Working directory passed through context |
| `root` | `string` | `undefined` | Root identifier passed through context |
| `initialFilePath` | `string` | `undefined` | Initial file path passed through context |
| `defaultFileSort` | `DefaultFileSort` | `undefined` | Default sort config for file-based panels |
| `promptPrefix` | `string` | `undefined` | Prefix passed through context |
| `components` | `PanelComponents` | `undefined` | Static panel component overrides by panel ID |
| `ephemeral` | `EphemeralPanels \| null` | `undefined` | Ephemeral side panel configuration |
| `mobilePanelId` | `string` | `undefined` | Active panel ID in mobile mode |
| `onMobilePanelChange` | `(id: string \| null) => void` | `undefined` | Callback when mobile panel changes |

### `WorkspaceLayout`

Lightweight layout renderer — renders a layout tree with resizable panels but no split/remove/swap/drag interactions. Good for read-only or simplified views.

```tsx
<WorkspaceLayout
  layout={layoutNode}
  onLayoutChange={setLayout}
  registry={registry}
  noHeader
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `LayoutNode` | — | The layout tree to render |
| `onLayoutChange` | `(layout: LayoutNode) => void` | — | Called when panel sizes change |
| `registry` | `AppRegistry` | `{}` | App type to component mapping |
| `components` | `PanelComponents` | `undefined` | Static panel component overrides |
| `renderEmpty` | `ComponentType<EmptyPanelProps>` | `undefined` | Custom component rendered in empty panels |
| `dashboardId` | `string` | `undefined` | Dashboard identifier for context |
| `cwd` | `string` | `'~'` | Working directory |
| `promptPrefix` | `string` | `undefined` | Prefix passed through context |
| `noHeader` | `boolean` | `undefined` | Hide panel headers |
| `isMobile` | `boolean` | `undefined` | Enable mobile mode |
| `mobilePanelId` | `string` | `undefined` | Active panel in mobile mode |
| `onMobileBack` | `(() => void) \| null` | `undefined` | Back button callback in mobile mode |

### `useWorkspace()`

Access workspace context from within any panel component.

```tsx
import { useWorkspace } from '@officerdev/workspace';

function MyPanel() {
  const { cwd, isMobile, maximizedPanelId, setMaximizedPanelId } = useWorkspace();
  // ...
}
```

Returns a `WorkspaceContextValue` with:

| Field | Type | Description |
|-------|------|-------------|
| `dashboardId` | `string \| null` | Current dashboard identifier |
| `cwd` | `string` | Working directory |
| `root` | `string \| undefined` | Root identifier |
| `initialFilePath` | `string \| undefined` | Initial file path |
| `defaultFileSort` | `DefaultFileSort \| undefined` | Default file sort config |
| `promptPrefix` | `string \| undefined` | Prompt prefix |
| `swapSourceId` | `string \| null` | Panel being swapped (if any) |
| `setSwapSourceId` | `(id: string \| null) => void` | Start/cancel swap mode |
| `onSwap` | `(sourceId, targetId) => void` | Execute a swap |
| `dragSourceId` | `string \| null` | Panel being dragged (if any) |
| `setDragSourceId` | `(id: string \| null) => void` | Start/cancel drag mode |
| `onMove` | `(sourceId, targetId, position) => void` | Execute a move |
| `maximizedPanelId` | `string \| null` | Currently maximized panel |
| `setMaximizedPanelId` | `(id: string \| null) => void` | Maximize/restore a panel |
| `transitioningPanelId` | `string \| null` | Panel currently animating |
| `isMobile` | `boolean` | Whether mobile mode is active |
| `onMobileBack` | `(() => void) \| null` | Back navigation callback |

### `WorkspaceProvider`

The raw context provider — use directly only if you need full control over the workspace context value. Normally you'd use `WorkspaceView` or `WorkspaceLayout` which set this up internally.

### Layout Utilities

Pure functions for manipulating the `LayoutNode` tree:

```ts
import {
  createDefaultLayout,
  splitPanel,
  removePanel,
  setApp,
  updateSizes,
  swapPanels,
  movePanel,
  pruneEmptyPanels,
  countPanels,
  hasAnyApp,
} from '@officerdev/workspace';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `createDefaultLayout` | `() => LayoutPanel` | Create a single empty panel |
| `splitPanel` | `(root, panelId, direction) => LayoutNode` | Split a panel horizontally or vertically |
| `removePanel` | `(root, panelId) => LayoutNode` | Remove a panel (no-op if only one remains) |
| `setApp` | `(root, panelId, appType) => LayoutNode` | Set the app type for a panel |
| `updateSizes` | `(root, groupId, sizes) => LayoutNode` | Update child sizes of a group |
| `swapPanels` | `(root, idA, idB) => LayoutNode` | Swap the app types of two panels |
| `movePanel` | `(root, sourceId, targetId, position) => LayoutNode` | Move a panel to a new position (top/bottom/left/right/center) |
| `pruneEmptyPanels` | `(root) => LayoutNode \| null` | Remove all panels with no app assigned |
| `countPanels` | `(node) => number` | Count total panels in the tree |
| `hasAnyApp` | `(node) => boolean` | Check if any panel has an app assigned |

### Types

| Type | Description |
|------|-------------|
| `LayoutNode` | Union of `LayoutGroup \| LayoutPanel` — the layout tree |
| `LayoutGroup` | A group node with `direction`, `children` (each `{ node, size }`) |
| `LayoutPanel` | A leaf node with `appType`, optional `fitContent` |
| `DashboardDefinition` | Dashboard metadata: `id`, `name`, `cwd`, optional `root`, `description` |
| `DashboardState` | Live layout state: `key`, `value` (LayoutNode), `setValue`, `isLoaded` |
| `ProjectType` | `'landing-page' \| 'website' \| 'app'` |
| `ProjectDefinition` | Project metadata with `projectType`, `cwd`, optional git/template info |
| `AppRegistry` | `Record<string, AppRegistryEntry>` — maps app keys to definitions |
| `AppRegistryEntry` | App definition: `name`, `icon`, `component`, optional `header`, `provider`, `transparent`, `fixedHeight`, `availableOnPanel` |
| `PanelComponents` | `Record<string, ComponentType \| PanelComponentEntry>` — panel overrides |
| `PanelComponentEntry` | Panel override with `component`, optional `header`, `provider`, `onClose` |
| `EphemeralPanels` | Side panel config: `layout`, `components`, optional `defaultBaseSize`, `onClose` |
| `EmptyPanelProps` | Props for `renderEmpty`: `{ panelId, registry, onSelect }` |
| `HomeRoot` | `'home' \| '~' \| 'officer.dev'` |
| `DropPosition` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'center'` |
| `DefaultFileSort` | `{ field: 'name' \| 'size' \| 'type' \| 'date'; direction: 'asc' \| 'desc' }` |

## App Registry

Define apps that can be assigned to panels:

```tsx
import type { AppRegistry } from '@officerdev/workspace';
import { FileText, Terminal } from 'lucide-react';

const registry: AppRegistry = {
  editor: {
    name: 'Editor',
    icon: FileText,
    component: ({ panelId }) => <Editor panelId={panelId} />,
    header: ({ panelId }) => <EditorHeader panelId={panelId} />,
  },
  terminal: {
    name: 'Terminal',
    icon: Terminal,
    component: ({ panelId }) => <TerminalView panelId={panelId} />,
    transparent: true, // no card chrome, renders directly
  },
};
```

## Fixed and Fit-Content Panels

Panels can be pinned to a fixed height or sized to their content in vertical groups:

**`fixedHeight`** — set on the `AppRegistryEntry`, gives the panel a fixed pixel height:

```tsx
const registry: AppRegistry = {
  toolbar: {
    name: 'Toolbar',
    icon: Settings,
    fixedHeight: 48,
    component: () => <div className="flex items-center h-full px-4">...</div>,
  },
};
```

**`fitContent`** — set on the `LayoutPanel` node, the panel shrinks to fit its content:

```tsx
const layout: LayoutNode = {
  type: 'group',
  id: 'root',
  direction: 'vertical',
  children: [
    { node: { type: 'panel', id: 'status', appType: 'statusbar', fitContent: true }, size: 0 },
    { node: { type: 'panel', id: 'main', appType: 'editor' }, size: 100 },
  ],
};
```

`fitContent` panels don't show maximize/close buttons.

## Empty Panels

By default, empty panels (no app assigned) render nothing. Pass a `renderEmpty` component to show a custom picker:

```tsx
import type { EmptyPanelProps } from '@officerdev/workspace';

const MyPicker = ({ onSelect }: EmptyPanelProps) => (
  <div className="flex gap-2">
    <button onClick={() => onSelect('notes')}>Notes</button>
    <button onClick={() => onSelect('terminal')}>Terminal</button>
  </div>
);

<WorkspaceView
  workspace={workspace}
  registry={registry}
  renderEmpty={MyPicker}
/>
```

## Ephemeral Panels

Open a temporary side panel alongside the main workspace:

```tsx
const [ephemeral, setEphemeral] = useState<EphemeralPanels | null>(null);

<WorkspaceView
  workspace={workspace}
  registry={registry}
  ephemeral={ephemeral}
/>

// Open an ephemeral panel
setEphemeral({
  layout: { type: 'panel', id: 'preview', appType: 'preview' },
  components: { preview: PreviewComponent },
  defaultBaseSize: 40, // main workspace takes 40%, ephemeral takes 60%
  onClose: () => setEphemeral(null),
});
```

## Mobile Support

Pass `isMobile` to switch to a single-panel view with back navigation:

```tsx
<WorkspaceView
  workspace={workspace}
  registry={registry}
  isMobile={true}
  mobilePanelId={activePanelId}
  onMobilePanelChange={setActivePanelId}
/>
```

## Styling

This package requires **Tailwind CSS v4+** and uses the following CSS variables for theming:

| Variable | Description |
|----------|-------------|
| `--color-background` | Page/maximized panel background |
| `--color-foreground` | Primary text color |
| `--color-border` | Panel borders and resize handles |
| `--color-card` | Panel background |
| `--color-card-foreground` | Panel text color |
| `--color-muted` | Muted backgrounds |
| `--color-muted-foreground` | Muted text |
| `--color-accent` | Interactive highlights |
| `--color-accent-foreground` | Text on accent backgrounds |
| `--color-popover` | Context menu background |
| `--color-popover-foreground` | Context menu text |
| `--color-primary` | Primary action color |
| `--color-primary-foreground` | Text on primary backgrounds |
| `--color-interactive` | Interactive element accent (swap/drag overlays, edit mode) |

## Peer Dependencies

| Package | Version |
|---------|---------|
| `react` | `^19` |
| `react-dom` | `^19` |
| `lucide-react` | `>=0.400` |
| `react-resizable-panels` | `>=3` |
| `@radix-ui/react-context-menu` | `>=2` |
| `clsx` | `>=2` |
| `tailwind-merge` | `>=2` |

## License

MIT
