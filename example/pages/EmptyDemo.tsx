import { useState } from "react";
import { WorkspaceView, createDefaultLayout } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry, EmptyPanel } from "../registry";

export const EmptyDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(createDefaultLayout);
  return (
    <WorkspaceView
      workspace={{ key: "empty", value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
      renderEmpty={EmptyPanel}
    />
  );
};
