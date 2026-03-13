import { Pencil, Check } from 'lucide-react';

type WorkspaceHeaderProps = {
  name: string;
  editing: boolean;
  onToggleEdit: () => void;
};

export const WorkspaceHeader = ({ name, editing, onToggleEdit }: WorkspaceHeaderProps) => (
  <div className="flex items-center gap-3 px-4 py-2 border-b border-interactive/10">
    <h2 className="text-sm font-bold text-interactive">{name}</h2>
    <button
      type="button"
      className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
        editing
          ? 'bg-interactive/15 text-interactive'
          : 'text-interactive/60 hover:text-interactive hover:bg-interactive/10'
      }`}
      onClick={onToggleEdit}
    >
      {editing ? <Check size={14} /> : <Pencil size={14} />}
      {editing ? 'Done' : 'Edit'}
    </button>
  </div>
);
