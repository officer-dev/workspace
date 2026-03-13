import { Columns, Rows, Trash2, X } from 'lucide-react';

type LayoutEditorProps = {
  panelId: string;
  hasWidget: boolean;
  isLastPanel: boolean;
  onSplit: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onRemove: (panelId: string) => void;
  onClearApp: () => void;
};

export const LayoutEditor = ({ panelId, hasWidget, isLastPanel, onSplit, onRemove, onClearApp }: LayoutEditorProps) => (
  <div className="absolute top-1 right-1 flex gap-1 z-10">
    <button
      type="button"
      className="p-1 rounded bg-interactive/10 border border-interactive/20 text-interactive/70 hover:text-interactive hover:bg-interactive/20 cursor-pointer"
      onClick={() => onSplit(panelId, 'horizontal')}
      title="Split Horizontal"
    >
      <Columns size={14} />
    </button>
    <button
      type="button"
      className="p-1 rounded bg-interactive/10 border border-interactive/20 text-interactive/70 hover:text-interactive hover:bg-interactive/20 cursor-pointer"
      onClick={() => onSplit(panelId, 'vertical')}
      title="Split Vertical"
    >
      <Rows size={14} />
    </button>
    {hasWidget && (
      <button
        type="button"
        className="p-1 rounded bg-interactive/10 border border-interactive/20 text-interactive/70 hover:text-interactive hover:bg-interactive/20 cursor-pointer"
        onClick={onClearApp}
        title="Clear Widget"
      >
        <X size={14} />
      </button>
    )}
    {!isLastPanel && (
      <button
        type="button"
        className="p-1 rounded bg-red-400/10 border border-red-400/30 text-red-400/70 hover:text-red-400 hover:bg-red-400/20 cursor-pointer"
        onClick={() => onRemove(panelId)}
        title="Remove Panel"
      >
        <Trash2 size={14} />
      </button>
    )}
  </div>
);
