import { useState } from "react";
import { WorkspaceView, createDefaultLayout, splitPanel, setApp } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry, EmptyPanel } from "../registry";

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

export const SplitDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(buildLayout);
  return (
    <WorkspaceView
      workspace={{ key: "split", value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
      renderEmpty={EmptyPanel}
    />
  );
};
