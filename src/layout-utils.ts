import type { LayoutNode, LayoutPanel, LayoutGroup } from './types';

let counter = 0;
const uid = () => `p-${Date.now()}-${++counter}`;

export const createDefaultLayout = (): LayoutPanel => ({
  type: 'panel',
  id: uid(),
  appType: null,
});

export function splitPanel(root: LayoutNode, panelId: string, direction: 'horizontal' | 'vertical'): LayoutNode {
  return splitInner(root, panelId, direction);
}

function splitInner(node: LayoutNode, panelId: string, direction: 'horizontal' | 'vertical'): LayoutNode {
  if (node.type === 'panel') {
    if (node.id !== panelId) return node;

    const newPanel: LayoutPanel = { type: 'panel', id: uid(), appType: null };
    const group: LayoutGroup = {
      type: 'group',
      id: uid(),
      direction,
      children: [
        { node, size: 50 },
        { node: newPanel, size: 50 },
      ],
    };
    return group;
  }

  // Check if the target panel is a direct child and the directions match — append as sibling
  const childIdx = node.children.findIndex((c) => c.node.type === 'panel' && c.node.id === panelId);
  if (childIdx !== -1 && node.direction === direction) {
    const newPanel: LayoutPanel = { type: 'panel', id: uid(), appType: null };
    const newChildren = [
      ...node.children.slice(0, childIdx + 1),
      { node: newPanel, size: 0 },
      ...node.children.slice(childIdx + 1),
    ];
    const size = 100 / newChildren.length;
    return { ...node, children: newChildren.map((c) => ({ ...c, size })) };
  }

  // Recurse into children
  const newChildren = node.children.map((child) => ({
    ...child,
    node: splitInner(child.node, panelId, direction),
  }));
  if (newChildren.some((c, i) => c.node !== node.children[i]!.node)) {
    return { ...node, children: newChildren };
  }
  return node;
}

export function removePanel(root: LayoutNode, panelId: string): LayoutNode {
  if (root.type === 'panel') return root;
  if (countPanels(root) <= 1) return root;

  return removePanelInner(root);

  function removePanelInner(node: LayoutNode): LayoutNode {
    if (node.type === 'panel') return node;

    const filtered = node.children.filter((c) => !(c.node.type === 'panel' && c.node.id === panelId));

    if (filtered.length < node.children.length) {
      if (filtered.length === 0) return createDefaultLayout();
      if (filtered.length === 1) return filtered[0]!.node;
      const total = filtered.reduce((sum, c) => sum + c.size, 0);
      return {
        ...node,
        children: filtered.map((c) => ({ ...c, size: (c.size / total) * 100 })),
      };
    }

    const newChildren = node.children.map((child) => ({
      ...child,
      node: removePanelInner(child.node),
    }));

    const unwrapped = newChildren.map((child) => {
      if (child.node.type === 'group' && child.node.children.length === 1) {
        return { ...child, node: child.node.children[0]!.node };
      }
      return child;
    });

    return { ...node, children: unwrapped };
  }
}

export function setApp(root: LayoutNode, panelId: string, appType: string | null): LayoutNode {
  if (root.type === 'panel') {
    return root.id === panelId ? { ...root, appType } : root;
  }
  const newChildren = root.children.map((child) => ({
    ...child,
    node: setApp(child.node, panelId, appType),
  }));
  return { ...root, children: newChildren };
}

export function updateSizes(root: LayoutNode, groupId: string, sizes: number[]): LayoutNode {
  if (root.type === 'panel') return root;
  if (root.id === groupId) {
    return {
      ...root,
      children: root.children.map((child, i) => ({ ...child, size: sizes[i] ?? child.size })),
    };
  }
  const newChildren = root.children.map((child) => ({
    ...child,
    node: updateSizes(child.node, groupId, sizes),
  }));
  return { ...root, children: newChildren };
}

export function pruneEmptyPanels(root: LayoutNode): LayoutNode | null {
  if (root.type === 'panel') {
    return root.appType ? root : null;
  }

  const pruned = root.children
    .map((child) => {
      const node = pruneEmptyPanels(child.node);
      return node ? { ...child, node } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (pruned.length === 0) return null;
  if (pruned.length === 1) return pruned[0]!.node;

  const total = pruned.reduce((sum, c) => sum + c.size, 0);
  return {
    ...root,
    children: pruned.map((c) => ({ ...c, size: (c.size / total) * 100 })),
  };
}

export type DropPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export function movePanel(root: LayoutNode, sourceId: string, targetId: string, position: DropPosition): LayoutNode {
  if (sourceId === targetId) return root;
  if (position === 'center') return swapPanels(root, sourceId, targetId);

  const sourceApp = findPanelApp(root, sourceId);
  if (sourceApp === undefined) return root;

  let result = removePanel(root, sourceId);
  const direction = position === 'top' || position === 'bottom' ? 'vertical' : 'horizontal';
  const before = position === 'top' || position === 'left';
  return insertPanel(result, targetId, direction, before, sourceApp);
}

function insertPanel(node: LayoutNode, targetId: string, direction: 'horizontal' | 'vertical', before: boolean, appType: string | null): LayoutNode {
  if (node.type === 'panel') {
    if (node.id !== targetId) return node;
    const newPanel: LayoutPanel = { type: 'panel', id: uid(), appType };
    const children = before
      ? [{ node: newPanel, size: 50 }, { node, size: 50 }]
      : [{ node, size: 50 }, { node: newPanel, size: 50 }];
    return { type: 'group', id: uid(), direction, children };
  }

  const childIdx = node.children.findIndex((c) => c.node.type === 'panel' && c.node.id === targetId);
  if (childIdx !== -1 && node.direction === direction) {
    const newPanel: LayoutPanel = { type: 'panel', id: uid(), appType };
    const insertIdx = before ? childIdx : childIdx + 1;
    const newChildren = [
      ...node.children.slice(0, insertIdx),
      { node: newPanel, size: 0 },
      ...node.children.slice(insertIdx),
    ];
    const size = 100 / newChildren.length;
    return { ...node, children: newChildren.map((c) => ({ ...c, size })) };
  }

  const newChildren = node.children.map((child) => ({
    ...child,
    node: insertPanel(child.node, targetId, direction, before, appType),
  }));
  if (newChildren.some((c, i) => c.node !== node.children[i]!.node)) {
    return { ...node, children: newChildren };
  }
  return node;
}

export function swapPanels(root: LayoutNode, idA: string, idB: string): LayoutNode {
  const appA = findPanelApp(root, idA);
  const appB = findPanelApp(root, idB);
  if (appA === undefined || appB === undefined) return root;
  return setApp(setApp(root, idA, appB), idB, appA);
}

function findPanelApp(node: LayoutNode, panelId: string): string | null | undefined {
  if (node.type === 'panel') return node.id === panelId ? node.appType : undefined;
  for (const child of node.children) {
    const result = findPanelApp(child.node, panelId);
    if (result !== undefined) return result;
  }
  return undefined;
}

export function countPanels(node: LayoutNode): number {
  if (node.type === 'panel') return 1;
  return node.children.reduce((sum, child) => sum + countPanels(child.node), 0);
}

export function hasAnyApp(node: LayoutNode): boolean {
  if (node.type === 'panel') return node.appType !== null;
  return node.children.some((child) => hasAnyApp(child.node));
}
