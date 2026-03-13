import { createContext, useContext } from 'react';

import type { DropPosition } from './layout-utils';

export type DefaultFileSort = {
  field: 'name' | 'size' | 'type' | 'date';
  direction: 'asc' | 'desc';
};

type WorkspaceContextValue = {
  dashboardId: string | null;
  cwd: string;
  root?: string;
  initialFilePath?: string;
  defaultFileSort?: DefaultFileSort;
  promptPrefix?: string;
  swapSourceId: string | null;
  setSwapSourceId: (id: string | null) => void;
  onSwap: (sourceId: string, targetId: string) => void;
  dragSourceId: string | null;
  setDragSourceId: (id: string | null) => void;
  onMove: (sourceId: string, targetId: string, position: DropPosition) => void;
  maximizedPanelId: string | null;
  setMaximizedPanelId: (id: string | null) => void;
  transitioningPanelId: string | null;
  isMobile: boolean;
  onMobileBack: (() => void) | null;
};

const noop = () => {};

const WorkspaceContext = createContext<WorkspaceContextValue>({
  dashboardId: null,
  cwd: '~',
  swapSourceId: null,
  setSwapSourceId: noop,
  onSwap: noop,
  dragSourceId: null,
  setDragSourceId: noop,
  onMove: noop,
  maximizedPanelId: null,
  setMaximizedPanelId: noop,
  transitioningPanelId: null,
  isMobile: false,
  onMobileBack: null,
});

export const WorkspaceProvider = WorkspaceContext.Provider;

export const useWorkspace = () => useContext(WorkspaceContext);
