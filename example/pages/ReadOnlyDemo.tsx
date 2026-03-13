import { useState } from "react";
import { WorkspaceLayout, createDefaultLayout, splitPanel, setApp } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry } from "../registry";

const buildLayout = (): LayoutNode => {
  let layout: LayoutNode = createDefaultLayout();
  layout = splitPanel(layout, layout.id, "horizontal");
  if (layout.type === "group") {
    const [first, second] = layout.children;
    layout = setApp(layout, first!.node.id, "notes");
    layout = setApp(layout, second!.node.id, "terminal");
  }
  return layout;
};

export const ReadOnlyDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(buildLayout);
  return (
    <WorkspaceLayout
      layout={layout}
      onLayoutChange={setLayout}
      registry={registry}
      noHeader
    />
  );
};
