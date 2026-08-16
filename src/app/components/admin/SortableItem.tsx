import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isDragHandle?: boolean;
}

export function SortableItem({ id, children, isDragHandle = true }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : "auto",
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? "cursor-grabbing shadow-2xl scale-[1.02]" : ""}`}
    >
      {isDragHandle && (
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Reordenar elemento"
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-brand-dark/90 border border-brand-cream/15 text-brand-cream/60 hover:text-brand-blush hover:border-brand-blush/40 cursor-grab active:cursor-grabbing backdrop-blur-xs transition-colors opacity-90 group-hover:opacity-100"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}
