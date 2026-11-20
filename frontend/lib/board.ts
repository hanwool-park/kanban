import { arrayMove } from "@dnd-kit/sortable";

export type Card = { id: string; title: string; details: string };
export type Column = { id: string; title: string; cards: Card[] };

export function renameColumn(columns: Column[], columnId: string, title: string): Column[] {
  return columns.map((c) => (c.id === columnId ? { ...c, title } : c));
}

export function addCard(columns: Column[], columnId: string, card: Card): Column[] {
  return columns.map((c) => (c.id === columnId ? { ...c, cards: [...c.cards, card] } : c));
}

export function deleteCard(columns: Column[], cardId: string): Column[] {
  return columns.map((c) => ({ ...c, cards: c.cards.filter((card) => card.id !== cardId) }));
}

// id는 컬럼 id 또는 카드 id
export function findColumn(columns: Column[], id: string): Column | undefined {
  return columns.find((c) => c.id === id || c.cards.some((card) => card.id === id));
}

// overId가 카드면 그 카드 자리로, 컬럼이면 그 컬럼 맨 끝으로 이동
export function moveCard(columns: Column[], activeId: string, overId: string): Column[] {
  const from = findColumn(columns, activeId);
  const to = findColumn(columns, overId);
  if (!from || !to || activeId === overId) return columns;

  const fromIndex = from.cards.findIndex((card) => card.id === activeId);
  const overIndex = to.cards.findIndex((card) => card.id === overId);

  if (from.id === to.id) {
    if (overIndex === -1) return columns;
    return columns.map((c) => (c.id === from.id ? { ...c, cards: arrayMove(c.cards, fromIndex, overIndex) } : c));
  }

  const card = from.cards[fromIndex];
  const insertAt = overIndex === -1 ? to.cards.length : overIndex;
  return columns.map((c) => {
    if (c.id === from.id) return { ...c, cards: c.cards.filter((x) => x.id !== activeId) };
    if (c.id === to.id) return { ...c, cards: [...c.cards.slice(0, insertAt), card, ...c.cards.slice(insertAt)] };
    return c;
  });
}
