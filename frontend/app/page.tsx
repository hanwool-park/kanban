import Board from "@/components/Board";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-t-4 border-accent bg-white shadow-[0_1px_0_0_rgb(226_232_240)]">
        <div className="flex flex-wrap items-end justify-between gap-4 px-8 py-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Project board</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy">Product Launch</h1>
          </div>
          <p className="text-sm text-muted">Drag cards between columns. Click a column title to rename it.</p>
        </div>
      </header>
      <Board />
    </main>
  );
}
