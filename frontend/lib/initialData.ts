import type { Column } from "./board";

export const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      { id: "card-1", title: "Competitive analysis", details: "Summarize pricing and positioning of the top five competitors." },
      { id: "card-2", title: "Customer interview script", details: "Draft questions for the next round of discovery calls." },
      { id: "card-3", title: "Referral program", details: "Explore incentives for customers who invite their team." },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "card-4", title: "Landing page copy", details: "Write the headline, value props and FAQ for the launch page." },
      { id: "card-5", title: "Pricing page design", details: "Three-tier layout with an annual billing toggle." },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [
      { id: "card-6", title: "Onboarding flow", details: "Build the three-step setup wizard for new workspaces." },
      { id: "card-7", title: "Launch email campaign", details: "Prepare the announcement and the follow-up sequence." },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      { id: "card-8", title: "Analytics events", details: "Verify tracking for sign-up and activation events." },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      { id: "card-9", title: "Brand guidelines", details: "Finalize logo usage, typography and color palette." },
      { id: "card-10", title: "Beta feedback summary", details: "Group findings from 40 beta users into themes." },
    ],
  },
];
