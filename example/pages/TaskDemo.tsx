import { useState } from "react";
import { WorkspaceView } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry, EmptyPanel } from "../registry";

const buildLayout = (): LayoutNode => ({
  type: "group",
  id: "task-root",
  direction: "vertical",
  children: [
    { node: { type: "panel", id: "task-status", appType: "statusbar", fitContent: true }, size: 0 },
    {
      node: {
        type: "group",
        id: "task-body",
        direction: "horizontal",
        children: [
          { node: { type: "panel", id: "task-steps", appType: "steps" }, size: 35 },
          { node: { type: "panel", id: "task-output", appType: "terminal" }, size: 65 },
        ],
      },
      size: 100,
    },
  ],
});

export const TaskDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(buildLayout);
  return (
    <WorkspaceView
      workspace={{ key: "task", value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
      renderEmpty={EmptyPanel}
    />
  );
};
