import { useState } from "react";
import { WorkspaceView, createDefaultLayout, splitPanel, setApp } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry, EmptyPanel } from "../registry";

const buildLayout = (): LayoutNode => {
  let layout: LayoutNode = createDefaultLayout();
  layout = splitPanel(layout, layout.id, "vertical");
  if (layout.type !== "group") return layout;

  const [top, bottom] = layout.children;
  layout = splitPanel(layout, top!.node.id, "horizontal");
  if (layout.type !== "group") return layout;

  layout = splitPanel(layout, bottom!.node.id, "horizontal");
  if (layout.type !== "group") return layout;

  const topGroup = layout.children[0]!.node;
  const bottomGroup = layout.children[1]!.node;
  if (topGroup.type === "group" && bottomGroup.type === "group") {
    layout = setApp(layout, topGroup.children[0]!.node.id, "overview");
    layout = setApp(layout, topGroup.children[1]!.node.id, "notes");
    layout = setApp(layout, bottomGroup.children[0]!.node.id, "chat");
    layout = setApp(layout, bottomGroup.children[1]!.node.id, "terminal");
  }
  return layout;
};

export const GridDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(buildLayout);
  return (
    <WorkspaceView
      workspace={{ key: "grid", value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
      renderEmpty={EmptyPanel}
    />
  );
};
