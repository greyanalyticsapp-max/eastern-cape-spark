import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
// Vite ?raw import: the markdown file lives at the repo root and is bundled
// as a string at build time. No runtime fetch, no path resolution issues on
// the Cloudflare Workers runtime.
import mdSource from "../../prod-readiness.md?raw";

export const Route = createFileRoute("/prod")({
  head: () => ({
    meta: [
      { title: "Production Readiness — Grey Analytics" },
      {
        name: "description",
        content:
          "Living production-readiness report for Grey Analytics: routes, features, blockers, and completion order.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Production Readiness — Grey Analytics" },
      {
        property: "og:description",
        content: "Route-by-route production checklist and blocker list for Grey Analytics.",
      },
    ],
  }),
  component: ProdPage,
});

// Extract H2 headings for the sticky table of contents.
function useToc(source: string) {
  const items: { id: string; label: string }[] = [];
  const lines = source.split("\n");
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      const label = m[1].trim();
      const id = label
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      items.push({ id, label });
    }
  }
  return items;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function ProdPage() {
  const toc = useToc(mdSource);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="size-3.5" /> Back to Welcome
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Production Readiness
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              A living, developer-facing audit of Grey Analytics against a
              production-ready standard. Rendered from{" "}
              <code className="text-foreground">prod-readiness.md</code>.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav
            aria-label="Table of contents"
            className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto pr-2 text-sm space-y-1"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Contents
            </p>
            {toc.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="block py-1 text-muted-foreground hover:text-foreground truncate"
              >
                {t.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="prod-md min-w-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-extrabold tracking-tight mt-2 mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => {
                const text = String(children);
                return (
                  <h2
                    id={slugify(text)}
                    className="scroll-mt-6 text-2xl font-bold tracking-tight mt-10 mb-4 pb-2 border-b border-border/60"
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-6 mb-2">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold mt-4 mb-2">{children}</h4>
              ),
              p: ({ children }) => (
                <p className="my-3 leading-7 text-sm sm:text-[15px] text-foreground/90">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="my-3 space-y-1 text-sm sm:text-[15px]">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="my-3 ml-6 list-decimal space-y-1 text-sm sm:text-[15px]">
                  {children}
                </ol>
              ),
              li: ({ children }) => {
                const raw = String(
                  Array.isArray(children)
                    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
                    : children,
                );
                let mark: React.ReactNode = <span className="mr-2">•</span>;
                let cleaned: React.ReactNode = children;
                if (raw.startsWith("[✅]")) {
                  mark = (
                    <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-xs">
                      ✓
                    </span>
                  );
                  cleaned = raw.replace(/^\[✅\]\s*/, "");
                } else if (raw.startsWith("[❌]")) {
                  mark = (
                    <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-xs">
                      ✕
                    </span>
                  );
                  cleaned = raw.replace(/^\[❌\]\s*/, "");
                } else if (raw.startsWith("[⚠️]")) {
                  mark = (
                    <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-xs">
                      !
                    </span>
                  );
                  cleaned = raw.replace(/^\[⚠️\]\s*/, "");
                }
                return (
                  <li className="flex items-start leading-6">
                    {mark}
                    <span className="min-w-0">{cleaned}</span>
                  </li>
                );
              },
              table: ({ children }) => (
                <div className="my-4 overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-xs sm:text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/40 text-left">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 font-semibold border-b border-border/60">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 border-b border-border/40 align-top">
                  {children}
                </td>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-muted/60 text-[0.85em] font-mono">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-4 border-l-4 border-primary/60 bg-muted/30 pl-4 py-2 italic text-sm">
                  {children}
                </blockquote>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  {children}
                </a>
              ),
              hr: () => <hr className="my-8 border-border/60" />,
            }}
          >
            {mdSource}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}