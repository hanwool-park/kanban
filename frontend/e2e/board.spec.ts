import { expect, test, type Locator, type Page } from "@playwright/test";

let errors: string[];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

const column = (page: Page, name: string) => page.getByRole("region", { name });
const card = (page: Page, title: string) => page.getByRole("button", { name: title, exact: true });
const titles = (page: Page, name: string) => column(page, name).getByRole("heading", { level: 3 });

async function drag(page: Page, source: Locator, target: Locator, edge: "top" | "center" | "bottom" = "center") {
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  const y = { top: to.y + 4, center: to.y + to.height / 2, bottom: to.y + to.height - 4 }[edge];
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, y, { steps: 25 });
  await page.mouse.up();
}

test("shows the board with five columns and dummy cards", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product Launch");
  const inputs = page.getByRole("textbox", { name: "Column title" });
  await expect(inputs).toHaveCount(5);
  for (const [i, name] of ["Backlog", "To Do", "In Progress", "Review", "Done"].entries()) {
    await expect(inputs.nth(i)).toHaveValue(name);
  }
  await expect(titles(page, "Backlog")).toHaveText(["Competitive analysis", "Customer interview script", "Referral program"]);
  await expect(card(page, "Landing page copy")).toContainText("Write the headline, value props and FAQ");
});

test("renames a column", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "Column title" }).nth(3);
  await expect(input).toHaveValue("Review");
  await input.fill("QA");
  await input.blur();
  await expect(column(page, "QA")).toBeVisible();
  await expect(titles(page, "QA")).toHaveText(["Analytics events"]);
});

test("adds a card", async ({ page }) => {
  const todo = column(page, "To Do");
  await todo.getByRole("button", { name: "Add card" }).click();
  await todo.getByRole("textbox", { name: "Card title" }).fill("Write release notes");
  await todo.getByRole("textbox", { name: "Card details" }).fill("Cover the main features.");
  await todo.getByRole("button", { name: "Add card" }).click();
  await expect(titles(page, "To Do")).toHaveText(["Landing page copy", "Pricing page design", "Write release notes"]);
  await expect(card(page, "Write release notes")).toContainText("Cover the main features.");
});

test("cancels adding a card", async ({ page }) => {
  const todo = column(page, "To Do");
  await todo.getByRole("button", { name: "Add card" }).click();
  await todo.getByRole("textbox", { name: "Card title" }).fill("Discarded");
  await todo.getByRole("button", { name: "Cancel" }).click();
  await expect(todo.getByRole("textbox", { name: "Card title" })).toHaveCount(0);
  await expect(titles(page, "To Do")).toHaveText(["Landing page copy", "Pricing page design"]);
});

test("deletes a card", async ({ page }) => {
  await card(page, "Pricing page design").hover();
  await page.getByRole("button", { name: "Delete Pricing page design" }).click();
  await expect(titles(page, "To Do")).toHaveText(["Landing page copy"]);
});

test("drags a card to another column", async ({ page }) => {
  await drag(page, card(page, "Landing page copy"), card(page, "Onboarding flow"));
  await expect(titles(page, "To Do")).toHaveText(["Pricing page design"]);
  await expect(titles(page, "In Progress")).toHaveCount(3);
  await expect(titles(page, "In Progress")).toContainText(["Landing page copy"]);
});

test("drags a card to the end of another column", async ({ page }) => {
  await drag(page, card(page, "Competitive analysis"), column(page, "Done"), "bottom");
  await expect(titles(page, "Done")).toHaveText(["Brand guidelines", "Beta feedback summary", "Competitive analysis"]);
  await expect(titles(page, "Backlog")).toHaveText(["Customer interview script", "Referral program"]);
});

test("reorders cards within a column", async ({ page }) => {
  await drag(page, card(page, "Competitive analysis"), card(page, "Referral program"), "bottom");
  await expect(titles(page, "Backlog")).toHaveText(["Customer interview script", "Referral program", "Competitive analysis"]);
});

test("drags a card into an empty column", async ({ page }) => {
  await card(page, "Analytics events").hover();
  await page.getByRole("button", { name: "Delete Analytics events" }).click();
  const placeholder = column(page, "Review").getByText("Drop cards here");
  await expect(placeholder).toBeVisible();

  await drag(page, card(page, "Brand guidelines"), placeholder);
  await expect(titles(page, "Review")).toHaveText(["Brand guidelines"]);
  await expect(titles(page, "Done")).toHaveText(["Beta feedback summary"]);
  await expect(placeholder).toHaveCount(0);
});

// 키보드 드래그로 "Landing page copy"를 오른쪽 컬럼으로 옮긴 상태까지 진행
async function keyboardDragRight(page: Page) {
  await card(page, "Landing page copy").focus();
  await page.keyboard.press("Space");
  // 드래그 미리보기가 렌더링되면 제목이 두 개가 된다. dnd-kit이 위치를 측정할 수 있도록 두 프레임 더 기다린 뒤 화살표를 누른다.
  await expect(page.getByRole("heading", { name: "Landing page copy" })).toHaveCount(2);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.keyboard.press("ArrowRight");
  await expect(titles(page, "In Progress")).toContainText(["Landing page copy"]);
}

test("moves a card with the keyboard", async ({ page }) => {
  await keyboardDragRight(page);
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Landing page copy" })).toHaveCount(1);
  await expect(titles(page, "To Do")).toHaveText(["Pricing page design"]);
  await expect(titles(page, "In Progress")).toContainText(["Landing page copy"]);
});

test("cancels a keyboard drag with Escape", async ({ page }) => {
  await keyboardDragRight(page);
  await page.keyboard.press("Escape");
  await expect(titles(page, "To Do")).toHaveText(["Landing page copy", "Pricing page design"]);
  await expect(titles(page, "In Progress")).toHaveText(["Onboarding flow", "Launch email campaign"]);
});

test("Enter on the delete button deletes instead of starting a drag", async ({ page }) => {
  await page.getByRole("button", { name: "Delete Landing page copy" }).focus();
  await page.keyboard.press("Enter");
  await expect(titles(page, "To Do")).toHaveText(["Pricing page design"]);
});
