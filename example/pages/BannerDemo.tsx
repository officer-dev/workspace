import { useState } from "react";
import { WorkspaceView } from "../../src/index";
import type { LayoutNode } from "../../src/index";
import { registry, EmptyPanel } from "../registry";

const buildLayout = (): LayoutNode => ({
  type: "group",
  id: "banner-root",
  direction: "vertical",
  children: [
    { node: { type: "panel", id: "banner-top", appType: "statusbar", fitContent: true }, size: 0 },
    {
      node: {
        type: "group",
        id: "banner-body",
        direction: "horizontal",
        children: [
          { node: { type: "panel", id: "banner-left", appType: "overview" }, size: 40 },
          {
            node: {
              type: "group",
              id: "banner-right",
              direction: "vertical",
              children: [
                { node: { type: "panel", id: "banner-notes", appType: "notes" }, size: 50 },
                { node: { type: "panel", id: "banner-chat", appType: "chat" }, size: 50 },
              ],
            },
            size: 60,
          },
        ],
      },
      size: 100,
    },
  ],
});

export const BannerDemo = () => {
  const [layout, setLayout] = useState<LayoutNode>(buildLayout);
  return (
    <WorkspaceView
      workspace={{ key: "banner", value: layout, setValue: setLayout, isLoaded: true }}
      registry={registry}
      renderEmpty={EmptyPanel}
    />
  );
};
