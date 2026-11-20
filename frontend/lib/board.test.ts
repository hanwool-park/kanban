import { describe, expect, it } from "vitest";
import { addCard, deleteCard, findColumn, moveCard, renameColumn, type Column } from "./board";
import { initialColumns } from "./initialData";

const columns: Column[] = [
  {
    id: "a",
    title: "A",
    cards: [
      { id: "a1", title: "A1", details: "" },
      { id: "a2", title: "A2", details: "" },
      { id: "a3", title: "A3", details: "" },
    ],
  },
  { id: "b", title: "B", cards: [{ id: "b1", title: "B1", details: "" }] },
  { id: "c", title: "C", cards: [] },
];

const ids = (cols: Column[], columnId: string) =>
  cols.find((c) => c.id === columnId)!.cards.map((card) => card.id);

describe("initialColumns", () => {
  it("has five columns with cards that have a title and details", () => {
    expect(initialColumns).toHaveLength(5);
    const cards = initialColumns.flatMap((c) => c.cards);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(Object.keys(card).sort()).toEqual(["details", "id", "title"]);
      expect(card.title).not.toBe("");
      expect(card.details).not.toBe("");
    }
  });

  it("uses unique ids across columns and cards", () => {
    const all = [...initialColumns.map((c) => c.id), ...initialColumns.flatMap((c) => c.cards.map((card) => card.id))];
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("renameColumn", () => {
  it("renames only the target column", () => {
    const result = renameColumn(columns, "b", "Doing");
    expect(result.map((c) => c.title)).toEqual(["A", "Doing", "C"]);
    expect(result[1].cards).toBe(columns[1].cards);
  });
});

describe("addCard", () => {
  it("appends the card to the end of the target column", () => {
    const card = { id: "new", title: "New", details: "Details" };
    const result = addCard(columns, "a", card);
    expect(ids(result, "a")).toEqual(["a1", "a2", "a3", "new"]);
    expect(result[0].cards[3]).toEqual(card);
    expect(ids(result, "b")).toEqual(["b1"]);
  });

  it("adds to an empty column", () => {
    const result = addCard(columns, "c", { id: "new", title: "New", details: "" });
    expect(ids(result, "c")).toEqual(["new"]);
  });
});

describe("deleteCard", () => {
  it("removes the card from its column", () => {
    const result = deleteCard(columns, "a2");
    expect(ids(result, "a")).toEqual(["a1", "a3"]);
    expect(ids(result, "b")).toEqual(["b1"]);
  });
});

describe("findColumn", () => {
  it("finds a column by its own id or by one of its card ids", () => {
    expect(findColumn(columns, "b")?.id).toBe("b");
    expect(findColumn(columns, "a3")?.id).toBe("a");
    expect(findColumn(columns, "missing")).toBeUndefined();
  });
});

describe("moveCard", () => {
  it("reorders a card within the same column", () => {
    expect(ids(moveCard(columns, "a1", "a3"), "a")).toEqual(["a2", "a3", "a1"]);
    expect(ids(moveCard(columns, "a3", "a1"), "a")).toEqual(["a3", "a1", "a2"]);
  });

  it("moves a card to another column at the position of the card it is over", () => {
    const result = moveCard(columns, "a2", "b1");
    expect(ids(result, "a")).toEqual(["a1", "a3"]);
    expect(ids(result, "b")).toEqual(["a2", "b1"]);
  });

  it("moves a card to the end of a column when over the column itself", () => {
    expect(ids(moveCard(columns, "a1", "b"), "b")).toEqual(["b1", "a1"]);
  });

  it("moves a card into an empty column", () => {
    const result = moveCard(columns, "b1", "c");
    expect(ids(result, "b")).toEqual([]);
    expect(ids(result, "c")).toEqual(["b1"]);
  });

  it("keeps the card data when moving between columns", () => {
    const result = moveCard(columns, "a1", "c");
    expect(result[2].cards[0]).toBe(columns[0].cards[0]);
  });

  it("returns the same board when nothing changes", () => {
    expect(moveCard(columns, "a1", "a1")).toBe(columns);
    expect(moveCard(columns, "a1", "a")).toBe(columns);
    expect(moveCard(columns, "a1", "missing")).toBe(columns);
  });
});
