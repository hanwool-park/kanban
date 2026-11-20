import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Board from "./Board";

const column = (name: string) => screen.getByRole("region", { name });
const cardTitles = (name: string) =>
  within(column(name))
    .queryAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);

describe("Board", () => {
  it("renders the five columns with dummy cards", () => {
    render(<Board />);
    const titles = screen.getAllByRole("textbox", { name: "Column title" }).map((input) => (input as HTMLInputElement).value);
    expect(titles).toEqual(["Backlog", "To Do", "In Progress", "Review", "Done"]);
    expect(within(column("To Do")).getByText("Landing page copy")).toBeInTheDocument();
    expect(within(column("To Do")).getByText(/headline, value props/)).toBeInTheDocument();
    expect(cardTitles("Done")).toEqual(["Brand guidelines", "Beta feedback summary"]);
  });

  it("renames a column", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const input = within(column("Review")).getByRole("textbox", { name: "Column title" });
    await user.clear(input);
    await user.type(input, "QA");
    expect(input).toHaveValue("QA");
    expect(within(column("QA")).getByText("Analytics events")).toBeInTheDocument();
  });

  it("adds a card to a column", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const todo = column("To Do");
    await user.click(within(todo).getByRole("button", { name: "Add card" }));
    await user.type(within(todo).getByRole("textbox", { name: "Card title" }), "Write release notes");
    await user.type(within(todo).getByRole("textbox", { name: "Card details" }), "Cover the main features.");
    await user.click(within(todo).getByRole("button", { name: "Add card" }));

    expect(cardTitles("To Do")).toEqual(["Landing page copy", "Pricing page design", "Write release notes"]);
    expect(within(todo).getByRole("button", { name: "Write release notes" })).toHaveTextContent("Cover the main features.");
    expect(within(todo).queryByRole("textbox", { name: "Card title" })).not.toBeInTheDocument();
  });

  it("does not allow adding a card without a title", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const todo = column("To Do");
    await user.click(within(todo).getByRole("button", { name: "Add card" }));
    const submit = within(todo).getByRole("button", { name: "Add card" });
    expect(submit).toBeDisabled();
    await user.type(within(todo).getByRole("textbox", { name: "Card title" }), "   ");
    expect(submit).toBeDisabled();
  });

  it("cancels adding a card", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const todo = column("To Do");
    await user.click(within(todo).getByRole("button", { name: "Add card" }));
    await user.type(within(todo).getByRole("textbox", { name: "Card title" }), "Discarded");
    await user.click(within(todo).getByRole("button", { name: "Cancel" }));

    expect(within(todo).queryByText("Discarded")).not.toBeInTheDocument();
    expect(cardTitles("To Do")).toEqual(["Landing page copy", "Pricing page design"]);

    await user.click(within(todo).getByRole("button", { name: "Add card" }));
    expect(within(todo).getByRole("textbox", { name: "Card title" })).toHaveValue("");
  });

  it("cancels adding a card with Escape", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const todo = column("To Do");
    await user.click(within(todo).getByRole("button", { name: "Add card" }));
    await user.keyboard("{Escape}");
    expect(within(todo).queryByRole("textbox", { name: "Card title" })).not.toBeInTheDocument();
  });

  it("deletes a card", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Delete Landing page copy" }));
    expect(screen.queryByText("Landing page copy")).not.toBeInTheDocument();
    expect(cardTitles("To Do")).toEqual(["Pricing page design"]);
  });

  it("shows an empty state when a column has no cards", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const review = column("Review");
    expect(within(review).queryByText("Drop cards here")).not.toBeInTheDocument();
    await user.click(within(review).getByRole("button", { name: "Delete Analytics events" }));
    expect(within(review).getByText("Drop cards here")).toBeInTheDocument();
  });
});
