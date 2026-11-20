"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { addCard, deleteCard, findColumn, moveCard, renameColumn } from "@/lib/board";
import { initialColumns } from "@/lib/initialData";
import BoardColumn from "./BoardColumn";
import { CardContent } from "./KanbanCard";

export default function Board() {
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const beforeDrag = useRef(columns);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeCard = columns.flatMap((c) => c.cards).find((card) => card.id === activeId);
  // 드래그 중인 카드는 onDragOver에서 실시간으로 옮겨지므로, 이 컬럼이 곧 놓일 컬럼이다.
  const targetColumnId = activeId ? findColumn(columns, activeId)?.id : undefined;

  function handleDragStart({ active }: DragStartEvent) {
    beforeDrag.current = columns;
    setActiveId(String(active.id));
  }

  // 다른 컬럼 위로 올라가면 바로 옮겨서 미리보기를 보여준다. 같은 컬럼 안 정렬은 드롭할 때 처리한다.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = findColumn(columns, String(active.id));
    const to = findColumn(columns, String(over.id));
    if (from && to && from.id !== to.id) {
      setColumns((cols) => moveCard(cols, String(active.id), String(over.id)));
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over) setColumns((cols) => moveCard(cols, String(active.id), String(over.id)));
    setActiveId(null);
  }

  function handleDragCancel() {
    setColumns(beforeDrag.current);
    setActiveId(null);
  }

  return (
    <DndContext
      id="board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-1 overflow-x-auto">
        <div className="grid min-w-[72rem] flex-1 grid-cols-5 gap-5 p-8">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              highlighted={column.id === targetColumnId}
              onRename={(title) => setColumns((cols) => renameColumn(cols, column.id, title))}
              onAddCard={(title, details) =>
                setColumns((cols) => addCard(cols, column.id, { id: crypto.randomUUID(), title, details }))
              }
              onDeleteCard={(cardId) => setColumns((cols) => deleteCard(cols, cardId))}
            />
          ))}
        </div>
      </div>
      <DragOverlay>{activeCard && <CardContent card={activeCard} overlay />}</DragOverlay>
    </DndContext>
  );
}
