import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { Card } from "@/lib/board";

export function CardContent({ card, overlay = false }: { card: Card; overlay?: boolean }) {
  return (
    <div
      className={`rounded-xl border-l-4 border-primary bg-white p-3.5 pr-9 ring-1 ${
        overlay ? "cursor-grabbing shadow-xl ring-primary/40" : "shadow-sm ring-slate-200"
      }`}
    >
      <h3 className="text-sm font-semibold text-navy">{card.title}</h3>
      {card.details && <p className="mt-1 text-sm leading-relaxed text-muted">{card.details}</p>}
    </div>
  );
}

export default function KanbanCard({ card, onDelete }: { card: Card; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={card.title}
      className={`group relative cursor-grab rounded-xl transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <CardContent card={card} />
      <button
        type="button"
        aria-label={`Delete ${card.title}`}
        onClick={onDelete}
        // Enter/Space가 카드로 전달되면 키보드 드래그가 시작되므로 막는다
        onKeyDown={(e) => e.stopPropagation()}
        className="absolute top-2.5 right-2.5 rounded-md p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}
