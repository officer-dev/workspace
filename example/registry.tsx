import type { AppRegistry, EmptyPanelProps } from "../src/index";
import { FileText, Terminal, MessageSquare, LayoutGrid, Info, Clock, Activity } from "lucide-react";

export const registry: AppRegistry = {
  notes: {
    name: "Notes",
    icon: FileText,
    component: () => (
      <div className="h-full w-full p-4">
        <textarea className="h-full w-full resize-none bg-transparent text-sm outline-none" defaultValue="A notes panel. Write anything here." />
      </div>
    ),
  },
  terminal: {
    name: "Terminal",
    icon: Terminal,
    component: () => (
      <div className="p-4 font-mono text-sm text-green-400 bg-black/80 h-full">
        $ hello from workspace
      </div>
    ),
  },
  chat: {
    name: "Chat",
    icon: MessageSquare,
    component: () => <div className="p-4 text-sm">Chat panel placeholder.</div>,
  },
  overview: {
    name: "Overview",
    icon: LayoutGrid,
    component: () => (
      <div className="p-4 text-sm space-y-2">
        <p className="font-semibold">Dashboard Overview</p>
        <p className="text-muted-foreground">Stats and metrics would go here.</p>
      </div>
    ),
  },
  statusbar: {
    name: "Status",
    icon: Activity,
    component: () => (
      <div className="flex flex-col gap-1.5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Build Discography</span>
          <span className="text-xs text-muted-foreground">Mar 13, 06:58 AM</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 2m 14s</span>
          <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> Running</span>
          <span className="ml-auto">Tokens: 12.4k in / 3.2k out</span>
          <span>Cost: $0.04</span>
        </div>
      </div>
    ),
  },
  steps: {
    name: "Steps",
    icon: Info,
    component: () => (
      <div className="p-4 text-sm space-y-1">
        {["fetch-data", "process-items", "validate-output", "generate-report", "upload-results"].map((step, i) => (
          <div key={step} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent">
            <span className={`h-2 w-2 rounded-full ${i < 3 ? "bg-green-500" : i === 3 ? "bg-yellow-500 animate-pulse" : "bg-muted"}`} />
            <span className="font-mono text-xs">{step}</span>
            {i < 3 && <span className="ml-auto text-xs text-muted-foreground">done</span>}
            {i === 3 && <span className="ml-auto text-xs text-yellow-500">running</span>}
          </div>
        ))}
      </div>
    ),
  },
};

export const EmptyPanel = ({ onSelect }: EmptyPanelProps) => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(registry).map(([key, entry]) => (
      <button
        key={key}
        type="button"
        onClick={() => onSelect(key)}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-accent cursor-pointer"
      >
        <entry.icon className="h-3.5 w-3.5" /> {entry.name}
      </button>
    ))}
  </div>
);
