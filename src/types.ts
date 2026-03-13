import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type LayoutGroup = {
  type: 'group';
  id: string;
  direction: 'horizontal' | 'vertical';
  children: { node: LayoutNode; size: number }[];
};

export type LayoutPanel = {
  type: 'panel';
  id: string;
  appType: string | null;
  fitContent?: boolean;
};

export type LayoutNode = LayoutGroup | LayoutPanel;

export type HomeRoot = 'home' | '~' | 'officer.dev';

export type DashboardDefinition = {
  id: string;
  name: string;
  cwd: string;
  root?: HomeRoot;
  description?: string;
  templateIdx?: number;
};

export type DashboardState = {
  key: string;
  value: LayoutNode;
  setValue: (value: LayoutNode | ((prev: LayoutNode) => LayoutNode)) => void;
  isLoaded: boolean;
};

export type ProjectType = 'landing-page' | 'website' | 'app';

export type ProjectDefinition = {
  id: string;
  name: string;
  cwd: string;
  description?: string;
  projectType: ProjectType;
  hasBackend?: boolean;
  hasAuth?: boolean;
  gitRepo?: string;
  templateIdx?: number;
};

export type AppRegistryEntry = {
  name: string;
  icon: LucideIcon;
  component: ComponentType<{ panelId: string }>;
  header?: ComponentType<{ panelId: string }>;
  provider?: ComponentType<{ panelId: string; children: ReactNode }>;
  transparent?: boolean;
  fixedHeight?: number;
  availableOnPanel?: boolean;
};

export type AppRegistry = Record<string, AppRegistryEntry>;

export type PanelComponentEntry = {
  component: ComponentType;
  header?: ComponentType;
  provider?: ComponentType<{ children: ReactNode }>;
  onClose?: () => void;
};

export type PanelComponents = Record<string, ComponentType | PanelComponentEntry>;

export type EphemeralPanels = {
  layout: LayoutNode;
  components: PanelComponents;
  defaultBaseSize?: number;
  onClose?: () => void;
};
