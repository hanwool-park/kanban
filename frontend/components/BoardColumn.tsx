import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column } from "@/lib/board";
import AddCardForm from "./AddCardForm";
import KanbanCard from "./KanbanCard";

type Props = {
  column: Column;
  highlighted: boolean;
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export default function BoardColumn({ column, highlighted, onRename, onAddCard, onDeleteCard }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <section
      aria-label={column.title}
      className={`flex flex-col rounded-2xl bg-slate-100 transition-shadow ${
        highlighted ? "ring-2 ring-accent" : "ring-1 ring-slate-200/80"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200/80 px-3 py-3">
        <input
          aria-label="Column title"
          value={column.title}
          onChange={(e) => onRename(e.target.value)}
          className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm font-semibold text-navy transition outline-none hover:bg-white/70 focus:bg-white focus:ring-2 focus:ring-primary/40"
        />
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-slate-200">
          {column.cards.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2.5 p-3">
        <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onDelete={() => onDeleteCard(card.id)} />
          ))}
        </SortableContext>
        {column.cards.length === 0 && (
          <p className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm text-muted">
            Drop cards here
          </p>
        )}
        <AddCardForm onAdd={onAddCard} />
      </div>
    </section>
  );
}
