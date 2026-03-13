import { useState } from "react";
import { WorkspaceView, createDefaultLayout, splitPanel, setApp } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry, EmptyPanel } from "../registry";

const buildLayout = (): LayoutNode => {
  let layout: LayoutNode = createDefaultLayout();
  layout = splitPanel(layout, layout.id, "horizontal");
  if (layout.type === "group") {
    const [first, second] = layout.children;
    layout = setApp(layout, first!.node.id, "overview");
    layout = splitPanel(layout, second!.node.id, "vertical");
    if (layout.type === "group") {
      const rightGroup = layout.children[1]!.node;
      if (rightGroup.type === "group") {
        layout = setApp(layout, rightGroup.children[0]!.node.id, "notes");
        layout = setApp(layout, rightGroup.children[1]!.node.id, "terminal");
      }
    }
  }
  return layout;
};

export const TripleDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(buildLayout);
  return (
    <WorkspaceView
      workspace={{ key: "triple", value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
      renderEmpty={EmptyPanel}
    />
  );
};
