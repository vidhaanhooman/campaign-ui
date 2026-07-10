"use client";

/**
 * /components — a live gallery of every primitive in components/ui/ (Base UI +
 * shadcn) plus the custom feature components we've built. Each section shows
 * a small runnable example, not documentation. Use it as a visual index.
 */

import * as React from "react";
import {
  ArrowRight,
  Bell,
  Bot,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Cog,
  Home,
  Info,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Star,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading, RangeTabs, NewMenu } from "@/components/stats/ui";

/* Primitives */
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchSelect, MultiSearchSelect, type SearchOption } from "@/components/ui/search-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* Custom / feature components */
import { NumberStepper } from "@/components/number-stepper";
import { KpiCard, MiniBar } from "@/components/stats/ui";
import { cn } from "@/lib/utils";

const AGENTS: SearchOption[] = [
  { value: "a1", label: "Support Bot", sub: "en_us", badge: "Voice", dot: true },
  { value: "a2", label: "Sales Outbound", sub: "en_us", badge: "Voice" },
  { value: "a3", label: "Debt Collection", sub: "hi_in", badge: "Voice" },
  { value: "a4", label: "Website Chat", sub: "en_us", badge: "Web" },
];

const SECTIONS = [
  { id: "rules", label: "Rules of making" },
  { id: "anatomy", label: "Anatomy" },
  { id: "drift", label: "Where anatomy drifts" },

  { id: "actions", label: "Actions" },
  { id: "badges", label: "Badges" },
  { id: "inputs", label: "Inputs" },
  { id: "selection", label: "Selection" },
  { id: "pickers", label: "Pickers" },
  { id: "overlays", label: "Overlays" },
  { id: "navigation", label: "Navigation" },
  { id: "data", label: "Data display" },
  { id: "feedback", label: "Feedback" },
  { id: "content", label: "Content" },
  { id: "feature", label: "Feature" },
];

export default function ComponentsPage() {
  return (
    <AppShell activeNav="Components">
      <TooltipProvider>
        <div className="mx-auto flex max-w-6xl gap-8 px-8 py-8">
          {/* Sticky ToC */}
          <aside className="sticky top-4 hidden h-fit w-44 shrink-0 lg:block">
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 space-y-14">
            <PageHeading
              title="Components"
              desc="Live index of every primitive in components/ui/ plus custom feature components. Click a rail item to jump to a section."
            />

            <RulesSection />
            <AnatomySection />
            <DriftSection />
            <ActionsSection />
            <BadgesSection />
            <InputsSection />
            <SelectionSection />
            <PickersSection />
            <OverlaysSection />
            <NavigationSection />
            <DataSection />
            <FeedbackSection />
            <ContentSection />
            <FeatureSection />
          </div>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}

/* ── Section + Demo helpers ────────────────────────────────────────── */

function Section({
  id,
  title,
  desc,
  children,
}: {
  id: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Demo({
  title,
  wide,
  children,
}: {
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5",
        wide && "sm:col-span-2",
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </div>
  );
}

/* ── Rules of making ───────────────────────────────────────────────── */

type Layer = {
  n: number;
  id: string;
  name: string;
  where: string;
  purpose: string;
  buildRule: string;
  mayUse: string[];
  mustNot: string[];
  examples: string[];
};

const LAYERS: Layer[] = [
  {
    n: 1,
    id: "L1",
    name: "Tokens",
    where: "app/globals.css",
    purpose:
      "The atomic design values — colors, radii, shadows, type scale, spacing. The one source of truth for how anything looks.",
    buildRule:
      "Add tokens only for values used in ≥3 places, and only after asking. A one-off value is not a token.",
    mayUse: ["Nothing — tokens sit at the bottom of the stack."],
    mustNot: [
      "Contain component-specific values (no --campaign-card-bg).",
      "Reach up into components.",
    ],
    examples: [
      "--background, --card, --popover, --border, --input, --ring",
      "--success/--warning/--info (+ -foreground)",
      "--text-xs, --text-xs · --radius · --spacing",
    ],
  },
  {
    n: 2,
    id: "L2",
    name: "Base UI primitives",
    where: "components/ui/*",
    purpose:
      "Headless behavioral atoms from the Base UI shadcn registry, styled only through tokens. Focus rings, keyboard nav, ARIA — free.",
    buildRule:
      "Install via `npx shadcn@latest add`, never hand-roll. Extend variants via cva inside the existing file. Never fork.",
    mayUse: ["Tokens (L1)."],
    mustNot: [
      "Import business logic or feature components.",
      "Hardcode a color, radius, or opacity outside the token system.",
      "Live outside components/ui/.",
    ],
    examples: [
      "Button, Input, Select, Popover, Dialog, Tooltip",
      "Table, Card, Badge, Avatar, Progress",
    ],
  },
  {
    n: 3,
    id: "L3",
    name: "Composed patterns",
    where: "components/ui/search-select.tsx · components/stats/ui.tsx",
    purpose:
      "Small compositions of primitives that recur across features. A thin domain-neutral shell over one or more primitives.",
    buildRule:
      "Build only when the same primitive combo appears ≥3 times. Keep props tight and API-shaped like the primitive it wraps.",
    mayUse: ["Tokens (L1)", "Primitives (L2)"],
    mustNot: [
      "Know about a specific feature (no campaign props, no agent IDs).",
      "Fetch data. Composed patterns are pure UI.",
      "Import feature components.",
    ],
    examples: [
      "SearchSelect, MultiSearchSelect (Combobox shells)",
      "RangeTabs, NewMenu, PageHeading, KpiCard, MiniBar, PageToolbar",
    ],
  },
  {
    n: 4,
    id: "L4",
    name: "Feature components",
    where: "components/* (non-ui)",
    purpose:
      "Domain-aware components that solve a real product problem — Campaign creation, Filter panel, Conversation review, Batch wizard.",
    buildRule:
      "Compose primitives and patterns; own the state for a single feature. One feature per file (or one folder if it's big).",
    mayUse: ["Tokens (L1)", "Primitives (L2)", "Patterns (L3)"],
    mustNot: [
      "Duplicate a primitive (hand-rolled Popover, custom Table).",
      "Reach sideways — a feature component doesn't import another feature's internals.",
      "Own routing.",
    ],
    examples: [
      "CreateCampaignDialog, ConversationReview, FilterDropdown",
      "BatchWizard, AddMetricDialog, UpdateCampaignDrawer",
    ],
  },
  {
    n: 5,
    id: "L5",
    name: "Pages",
    where: "app/*/page.tsx",
    purpose:
      "Route entry points. Wire the AppShell, load data, hand it to feature components. Layout only — no visual logic that could live in a feature.",
    buildRule:
      "Keep pages thin. If a page has >200 lines of JSX, something belongs in a feature.",
    mayUse: ["Everything below (L1–L4).", "Next.js data + routing APIs."],
    mustNot: [
      "Contain business logic that other pages would duplicate.",
      "Style with anything other than tokens.",
    ],
    examples: [
      "/campaigns, /qa, /stats, /insights, /landing",
      "/components (this page)",
    ],
  },
];

function RulesSection() {
  return (
    <section id="rules" className="scroll-mt-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Rules of making</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Five layers, from tokens up to pages. Each layer may only reach{" "}
          <em>down</em>. Adding something new? Find the lowest layer it belongs
          on — that's where it goes.
        </p>
      </div>

      {/* Layer stack — visual hierarchy */}
      <ol className="space-y-3">
        {LAYERS.map((L) => (
          <LayerCard key={L.id} L={L} />
        ))}
      </ol>

      {/* Decision guide + anti-patterns */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Where does my new thing go?
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="mr-1 font-mono text-xs text-foreground">1.</span>{" "}
              Is it a color / radius / spacing value?{" "}
              <span className="text-foreground">→ L1 (ask first).</span>
            </li>
            <li>
              <span className="mr-1 font-mono text-xs text-foreground">2.</span>{" "}
              Does an interactive primitive already exist?{" "}
              <span className="text-foreground">→ use L2 as-is.</span>
            </li>
            <li>
              <span className="mr-1 font-mono text-xs text-foreground">3.</span>{" "}
              Missing a primitive?{" "}
              <span className="text-foreground">
                → install via shadcn, do not hand-roll.
              </span>
            </li>
            <li>
              <span className="mr-1 font-mono text-xs text-foreground">4.</span>{" "}
              Same primitive combo used ≥3× across features?{" "}
              <span className="text-foreground">→ promote to L3.</span>
            </li>
            <li>
              <span className="mr-1 font-mono text-xs text-foreground">5.</span>{" "}
              Domain-aware, solves one product problem?{" "}
              <span className="text-foreground">→ L4 feature.</span>
            </li>
            <li>
              <span className="mr-1 font-mono text-xs text-foreground">6.</span>{" "}
              A route wiring the above together?{" "}
              <span className="text-foreground">→ L5 page.</span>
            </li>
          </ol>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/6 p-5">
          <h3 className="text-sm font-semibold text-destructive">
            Anti-patterns
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              ⛔ Hardcoding a hex, px, or rem outside <code>globals.css</code>.
            </li>
            <li>
              ⛔ Hand-rolling <em>Popover</em>, <em>Menu</em>, <em>Tooltip</em>,{" "}
              <em>Modal</em>, <em>Combobox</em> — always use the primitive.
            </li>
            <li>
              ⛔ Forking a primitive. Extend via <code>cva</code> in the same
              file.
            </li>
            <li>
              ⛔ Cross-feature imports (feature A imports feature B's internals).
            </li>
            <li>
              ⛔ Business logic inside a primitive or pattern.
            </li>
            <li>
              ⛔ <code>{`dark:bg-[#111]`}</code> or any literal dark override —
              that means a token is missing.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const INDENT = ["ms-0", "ms-3", "ms-6", "ms-9", "ms-12"] as const;

function LayerCard({ L }: { L: Layer }) {
  return (
    <li
      className={cn(
        "rounded-xl border border-border bg-card p-5",
        INDENT[L.n - 1],
      )}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground">
          L{L.n}
        </span>
        <h3 className="text-base font-semibold text-foreground">{L.name}</h3>
        <code className="text-xs text-muted-foreground">{L.where}</code>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{L.purpose}</p>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Rule
        </span>
        <p className="mt-1 text-sm text-foreground">{L.buildRule}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-foreground">
            May use
          </span>
          <ul className="mt-1.5 space-y-1 text-sm text-foreground">
            {L.mayUse.map((m) => (
              <li key={m} className="flex gap-1.5">
                <span className="text-foreground">✓</span> {m}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-destructive">
            Must not
          </span>
          <ul className="mt-1.5 space-y-1 text-sm text-foreground">
            {L.mustNot.map((m) => (
              <li key={m} className="flex gap-1.5">
                <span className="text-destructive">✗</span> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          In this codebase
        </span>
        <ul className="mt-1.5 space-y-0.5 text-sm text-muted-foreground">
          {L.examples.map((e) => (
            <li key={e} className="font-mono">
              {e}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/* ── Anatomy ───────────────────────────────────────────────────────── */

/**
 * Anatomy — the internal composition rules. Where does a description sit
 * relative to its label? Which token owns a trailing badge? These are the
 * "how the parts stack inside one component" patterns, expressed in tokens.
 */
function AnatomySection() {
  return (
    <section id="anatomy" className="scroll-mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Anatomy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where the parts sit inside a single component. Each pattern rendered
          in real tokens; the caption under it names the tokens used. The order
          on the token line matches the order of the parts on screen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TitleDescPattern />
        <MetaRowPattern />
        <ListItemPattern />
        <SettingRowPattern />
        <FormFieldPattern />
        <TwoColumnFormPattern />
        <ChatMessagePattern />
        <ChatInputPattern />
        <TabsToolbarPattern />
        <TabWithCountPattern />
        <TriggerChevronPattern />
        <CardWithActionPattern />
      </div>
    </section>
  );
}

/** Small wrapper: pattern label on top, live render, then the token line. */
function Anatomy({
  title,
  tokens,
  wide,
  children,
}: {
  title: string;
  tokens: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5",
        wide && "sm:col-span-2",
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      <div>{children}</div>
      <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
        {tokens}
      </p>
    </div>
  );
}

/* ── Composition patterns ──────────────────────────────────────────── */

/** Title + description stack. Used inside every card header and section. */
function TitleDescPattern() {
  return (
    <Anatomy
      title="Title + description"
      tokens="title: text-foreground · desc: text-muted-foreground · gap: mt-1"
    >
      <div className="text-base font-semibold text-foreground">Team Members</div>
      <p className="mt-1 text-sm text-muted-foreground">
        Invite your team members to collaborate.
      </p>
    </Anatomy>
  );
}

/** Meta row — a horizontal strip of dot · label · count · timestamp. */
function MetaRowPattern() {
  return (
    <Anatomy
      title="Meta row"
      tokens="dot: · label: text-foreground · rest: text-muted-foreground · gap-3"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <span className="size-2 rounded-full " /> TypeScript
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Star size={12} /> 20k
        </span>
        <span className="text-muted-foreground">Updated April 2023</span>
      </div>
    </Anatomy>
  );
}

/** List item — leading avatar/icon, name over sub, trailing action. */
function ListItemPattern() {
  return (
    <Anatomy
      title="List item"
      tokens="avatar: bg-secondary · name: text-foreground · sub: text-muted-foreground · action: right"
      wide
    >
      <ul className="flex flex-col gap-3">
        {[
          { name: "Sofia Davis", email: "m@example.com", role: "Owner", initials: "S" },
          { name: "Jackson Lee", email: "p@example.com", role: "Developer", initials: "J" },
          { name: "Isabella Nguyen", email: "i@example.com", role: "Billing", initials: "I" },
        ].map((m) => (
          <li key={m.email} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{m.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {m.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {m.email}
              </div>
            </div>
            <Button variant="outline" size="sm">
              {m.role} <ChevronRight className="-me-1 rotate-90 text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>
    </Anatomy>
  );
}

/** Setting row — label + description + trailing switch. Vertical stack of these = settings block. */
function SettingRowPattern() {
  return (
    <Anatomy
      title="Setting row"
      tokens="label: text-foreground · desc: text-muted-foreground · switch: right · rows separated by border-t border-border"
      wide
    >
      <div className="divide-y divide-border">
        {[
          {
            label: "Strictly Necessary",
            desc: "These cookies are essential in order to use the website and its features.",
            on: true,
          },
          {
            label: "Functional Cookies",
            desc: "These cookies allow the website to provide personalized functionality.",
            on: false,
          },
        ].map((r) => (
          <div key={r.label} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{r.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
            </div>
            <Switch defaultChecked={r.on} />
          </div>
        ))}
      </div>
    </Anatomy>
  );
}

/** Form field — label · input · description below. Optional error under description. */
function FormFieldPattern() {
  return (
    <Anatomy
      title="Form field"
      tokens="label: text-foreground · input: bg-input/30 border-border · hint: text-muted-foreground below"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="an-name">Workspace name</Label>
        <Input id="an-name" placeholder="Acme Inc." />
        <p className="text-xs text-muted-foreground">
          Displayed on invoices and in the sidebar.
        </p>
      </div>
    </Anatomy>
  );
}

/** Two-column form — side-by-side selects with independent labels. */
function TwoColumnFormPattern() {
  return (
    <Anatomy
      title="Two-column form"
      tokens="grid-cols-2 gap-4 · each column: Label + Trigger"
      wide
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Area</Label>
          <Select defaultValue="billing">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="deliverability">Deliverability</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Security Level</Label>
          <Select defaultValue="s2">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="s1">Severity 1</SelectItem>
              <SelectItem value="s2">Severity 2</SelectItem>
              <SelectItem value="s3">Severity 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Anatomy>
  );
}

/** Sent chat bubble — right-aligned, primary fill. Agent bubble left with card fill. */
function ChatMessagePattern() {
  return (
    <Anatomy
      title="Chat message"
      tokens="user: bg-primary text-primary-foreground ml-auto · agent: bg-card border border-border"
    >
      <div className="flex flex-col gap-2">
        <div className="ml-auto max-w-[70%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
          I can&rsquo;t log in.
        </div>
        <div className="mr-auto max-w-[70%] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
          Let&rsquo;s reset your password.
        </div>
      </div>
    </Anatomy>
  );
}

/** Chat input — muted fill, muted placeholder, primary circular send. */
function ChatInputPattern() {
  return (
    <Anatomy
      title="Chat input"
      tokens="row: bg-muted rounded-lg · placeholder: text-muted-foreground · send: size-8 rounded-full bg-primary"
    >
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
        <input
          placeholder="Type your message…"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          aria-label="Send"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </Anatomy>
  );
}

/** Toolbar — left tab cluster + right action cluster. Active tab uses primary pill. */
function TabsToolbarPattern() {
  const [tab, setTab] = React.useState("outline");
  const tabs = [
    { id: "outline", label: "Outline" },
    { id: "past", label: "Past Performance", count: 3 },
    { id: "key", label: "Key Personnel", count: 2 },
    { id: "docs", label: "Focus Documents" },
  ];
  return (
    <Anatomy
      title="Toolbar — tabs + actions"
      tokens="row: bg-card rounded-lg p-1 · active: bg-primary text-primary-foreground · action cluster: right"
      wide
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-sm transition-colors",
                  on
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {t.count != null && (
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                      on
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare /> Customize Columns
          </Button>
          <Button size="sm">
            <Plus /> Add Section
          </Button>
        </div>
      </div>
    </Anatomy>
  );
}

/** Tab / chip with trailing count badge. */
function TabWithCountPattern() {
  return (
    <Anatomy
      title="Tab with count"
      tokens="label: text-foreground · count: bg-muted text-muted-foreground rounded-full size-4"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
          Past Performance
          <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
            3
          </span>
        </span>
      </div>
    </Anatomy>
  );
}

/** Trigger button — label + trailing chevron. Applies to Select, Combobox, popover triggers. */
function TriggerChevronPattern() {
  return (
    <Anatomy
      title="Trigger + chevron"
      tokens="trigger: bg-input/30 border-border · chevron: text-muted-foreground size-4 · right-aligned"
    >
      <Button variant="outline" className="w-48 justify-between">
        Owner <ChevronRight className="rotate-90 text-muted-foreground" />
      </Button>
    </Anatomy>
  );
}

/** Card with header title + trailing action on the same row. */
function CardWithActionPattern() {
  return (
    <Anatomy
      title="Card — title + trailing action"
      tokens="title: text-foreground · trailing action: right · description: below title, text-muted-foreground"
      wide
    >
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-foreground">tweakcn</div>
            <p className="mt-1 text-sm text-muted-foreground">
              A visual editor for shadcn/ui components with beautiful themes.
              Accessible. Customizable. Open Source.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Star /> Star
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span className="size-2 rounded-full " /> TypeScript
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Star size={12} /> 20k
          </span>
          <span className="text-muted-foreground">Updated April 2023</span>
        </div>
      </div>
    </Anatomy>
  );
}

/* ── Where anatomy drifts ──────────────────────────────────────────── */

/**
 * Drift catalog — every way two "same" components can end up looking or
 * behaving differently. First half: visual GOOD/BAD comparisons of the six
 * most-common drifts. Second half: an enumeration of the rest, with the
 * one-line guardrail that catches each.
 */
function DriftSection() {
  return (
    <section id="drift" className="scroll-mt-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Where anatomy drifts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every place two components meant to look the same end up looking
          different. Each mode: how it slips in, a side-by-side or symptom
          line, and the guardrail that catches it.
        </p>
      </div>

      {/* Visual GOOD / BAD comparisons — the six drifts you spot fastest */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DescPlacementDrift />
        <RowAlignmentDrift />
        <ChevronPresenceDrift />
        <TabularNumsDrift />
        <ActiveStateDrift />
        <StatusColorDrift />
      </div>

      {/* Everything else — dense enumeration */}
      <DriftTable />

      {/* Review checklist */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">
          Before merging any UI change — anatomy checklist
        </h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            Every color goes to a token (search the diff for{" "}
            <code>#</code>, <code>rgb(</code>, raw palette names).
          </li>
          <li>
            Every size on the 4px scale (search for <code>-[Npx]</code> in the
            diff).
          </li>
          <li>
            Any repeated pattern already exists at L3? Reuse; don&rsquo;t
            recreate.
          </li>
          <li>
            Same rank of information → same token. Two labels in the same slot
            should look identical.
          </li>
          <li>
            Descriptions live under, actions live right. Numbers are{" "}
            <code>tabular-nums</code>. Uppercase eyebrows are{" "}
            <code>text-xs tracking-wider</code>.
          </li>
          <li>
            The empty, loading, and error states all use the same primitives
            as their filled counterparts.
          </li>
        </ol>
      </div>
    </section>
  );
}

/* ── Drift compare helpers ────────────────────────────────────────── */

function DriftCard({
  title,
  slip,
  rule,
  children,
}: {
  title: string;
  slip: string;
  rule: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{slip}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Rule · </span>
        {rule}
      </p>
    </div>
  );
}

function Bad({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-16 flex-col justify-center rounded-lg border border-destructive/30 bg-destructive/6 p-3">
      <div className="mb-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-destructive">
        ✗ Drift
      </div>
      {children}
    </div>
  );
}

function Good({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-16 flex-col justify-center rounded-lg border border-border p-3">
      <div className="mb-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-foreground">
        ✓ Consistent
      </div>
      {children}
    </div>
  );
}

/* ── The six visual drifts ─────────────────────────────────────────── */

function DescPlacementDrift() {
  return (
    <DriftCard
      title="Description placement"
      slip="Hint text sometimes sits beside the label, sometimes below, sometimes above the input."
      rule="Label above → input → description below. Errors go below the description."
    >
      <Bad>
        <div className="flex items-center gap-2">
          <Label className="shrink-0">Name</Label>
          <span className="text-xs text-muted-foreground">Displayed on invoices.</span>
        </div>
        <Input placeholder="Acme" className="mt-1.5 h-8" />
      </Bad>
      <Good>
        <Label>Name</Label>
        <Input placeholder="Acme" className="mt-1.5 h-8" />
        <p className="mt-1 text-xs text-muted-foreground">Displayed on invoices.</p>
      </Good>
    </DriftCard>
  );
}

function RowAlignmentDrift() {
  return (
    <DriftCard
      title="Row alignment"
      slip="Same row (icon + text + trailing action) center-aligned in one place, top-aligned in another."
      rule="One-line rows use items-center. Multi-line rows use items-start."
    >
      <Bad>
        <div className="flex items-start gap-2 rounded-md border border-border bg-background p-2">
          <User size={14} className="mt-0.5 text-muted-foreground" />
          <span className="flex-1 text-sm text-foreground">Sofia Davis</span>
          <Button size="xs" variant="outline">Edit</Button>
        </div>
      </Bad>
      <Good>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background p-2">
          <User size={14} className="text-muted-foreground" />
          <span className="flex-1 text-sm text-foreground">Sofia Davis</span>
          <Button size="xs" variant="outline">Edit</Button>
        </div>
      </Good>
    </DriftCard>
  );
}

function ChevronPresenceDrift() {
  return (
    <DriftCard
      title="Trigger affordance"
      slip="Some triggers show a chevron, some don't — users can't tell what opens a menu."
      rule="Every popover/select/menu trigger ends with a chevron in text-muted-foreground."
    >
      <Bad>
        <Button variant="outline" className="w-full justify-start">Owner</Button>
      </Bad>
      <Good>
        <Button variant="outline" className="w-full justify-between">
          Owner
          <ChevronRight className="rotate-90 text-muted-foreground" />
        </Button>
      </Good>
    </DriftCard>
  );
}

function TabularNumsDrift() {
  return (
    <DriftCard
      title="Numeric alignment"
      slip="Numbers in a column that jiggle horizontally because glyph widths vary."
      rule="Any digit that appears in a column (KPI, table, meter) uses tabular-nums."
    >
      <Bad>
        <div className="space-y-0.5 font-mono text-sm text-foreground">
          <div>1,248</div>
          <div>612</div>
          <div>32,891</div>
        </div>
      </Bad>
      <Good>
        <div className="space-y-0.5 font-mono tabular-nums text-sm text-foreground">
          <div>1,248</div>
          <div>612</div>
          <div>32,891</div>
        </div>
      </Good>
    </DriftCard>
  );
}

function ActiveStateDrift() {
  return (
    <DriftCard
      title="Active-state expression"
      slip="Active tab shown as underline in one page, as a pill-fill in another."
      rule="One active pattern per component family. Tabs = pill (bg-primary text-primary-foreground)."
    >
      <Bad>
        <div className="flex gap-4 border-b border-border">
          <span className="border-b-2 border-primary pb-1 text-sm text-foreground">Outline</span>
          <span className="pb-1 text-sm text-muted-foreground">Past</span>
        </div>
      </Bad>
      <Good>
        <div className="inline-flex gap-1 rounded-lg bg-secondary p-1">
          <span className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
            Outline
          </span>
          <span className="px-3 py-1 text-sm text-muted-foreground">Past</span>
        </div>
      </Good>
    </DriftCard>
  );
}

function StatusColorDrift() {
  return (
    <DriftCard
      title="Status color source"
      slip="One page uses raw amber-400 for 'warning', another uses the warning token."
      rule="All success / warning / info / error colors come from the semantic token, never the palette."
    >
      <Bad>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-400">
          <span className="size-1.5 rounded-full bg-amber-400" /> Warning
        </span>
      </Bad>
      <Good>
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium text-foreground">
          <span className="size-1.5 rounded-full " /> Warning
        </span>
      </Good>
    </DriftCard>
  );
}

/* ── Enumeration of every other drift ──────────────────────────────── */

const OTHER_DRIFTS: {
  category: string;
  mode: string;
  symptom: string;
  rule: string;
}[] = [
  {
    category: "Surface",
    mode: "Wrong background token",
    symptom: "A card sitting on bg-popover next to one on bg-card — same role, different tint.",
    rule: "bg-card = cards on background. bg-popover = floating layers only. bg-background = the page itself.",
  },
  {
    category: "Surface",
    mode: "Border token drift",
    symptom: "Cards using border-white/10 in one place and border-border in another.",
    rule: "Every hairline outline is border-border.",
  },
  {
    category: "Surface",
    mode: "Radius drift",
    symptom: "rounded-xl vs rounded-lg on visually identical cards.",
    rule: "Cards = rounded-xl · buttons/inputs = rounded-lg · chips/badges = rounded-md · pills = rounded-full.",
  },
  {
    category: "Density",
    mode: "Row height drift",
    symptom: "Inputs h-8 on Campaigns, h-9 on QA — form fields don't line up across pages.",
    rule: "Form inputs and triggers use h-8. Only Textarea grows.",
  },
  {
    category: "Density",
    mode: "Padding drift",
    symptom: "Card p-4 vs p-5 vs p-6 with no reason.",
    rule: "Cards use p-5 by default. Cramped cells use p-3. Dialogs use p-6.",
  },
  {
    category: "Density",
    mode: "Gap drift",
    symptom: "Same row uses gap-2 in one place and gap-3 in another.",
    rule: "Row of buttons/chips = gap-2. Row of labeled fields = gap-4.",
  },
  {
    category: "Type",
    mode: "Same-rank size drift",
    symptom: "Section titles alternating text-sm, text-base, text-lg on the same page.",
    rule: "One size per role. Page title = text-2xl · section = text-lg · card title = text-base.",
  },
  {
    category: "Type",
    mode: "Weight drift",
    symptom: "Label font-medium in one form, font-semibold in another.",
    rule: "Labels = font-medium. Titles = font-semibold. Body = normal.",
  },
  {
    category: "Type",
    mode: "Eyebrow casing",
    symptom: "Some eyebrows uppercase, some sentence case — the eye reads them as different features.",
    rule: "Uppercase eyebrow = text-xs font-medium uppercase tracking-wider text-muted-foreground.",
  },
  {
    category: "Color",
    mode: "Muted vs foreground opacity",
    symptom: "text-foreground/60 used for muted text in one place; text-muted-foreground in another.",
    rule: "Only two text tones inside a component: text-foreground and text-muted-foreground.",
  },
  {
    category: "Color",
    mode: "Icon color drift",
    symptom: "Icon inheriting a stray hue because a parent set text-primary/text-emerald.",
    rule: "Icons in muted contexts are text-muted-foreground. In primary buttons they inherit.",
  },
  {
    category: "State",
    mode: "Disabled expression",
    symptom: "Disabled = opacity-50 in one component, bg-muted in another, greyed-text in a third.",
    rule: "Disabled = opacity-50 pointer-events-none. Never re-tint.",
  },
  {
    category: "State",
    mode: "Hover expression",
    symptom: "Row hover:bg-accent in one list, hover:bg-secondary/60 in another — same list role.",
    rule: "Row hover = hover:bg-secondary/40. Menu item = hover:bg-accent.",
  },
  {
    category: "State",
    mode: "Loading expression",
    symptom: "Spinner in one place, Skeleton rows in another, dimmed content in a third — all for 'loading'.",
    rule: "Bounded content that will fill the same slot = Skeleton. Async action in a button = Spinner + disabled.",
  },
  {
    category: "State",
    mode: "Empty expression",
    symptom: "Bare 'No results' text in one list, EmptyState card in another.",
    rule: "Every empty list uses <EmptyState> — icon + title + description + optional action.",
  },
  {
    category: "State",
    mode: "Error expression",
    symptom: "Inline red text under an input in one form, an Alert card in another, a toast in a third.",
    rule: "Field errors = inline text-destructive under the field. Section errors = <Alert variant=\"destructive\">. Transient = toast.",
  },
  {
    category: "Icon",
    mode: "Icon direction",
    symptom: "Some 'expand' triggers use ChevronRight, some ChevronDown.",
    rule: "Row expand = ChevronRight rotated 90° on open. Menu open = ChevronDown.",
  },
  {
    category: "Icon",
    mode: "Icon-library mix",
    symptom: "Lucide next to Phosphor in the same view — different stroke weights read as different families.",
    rule: "One library per surface (this project = Lucide in features, Phosphor inside components/ui/).",
  },
  {
    category: "Icon",
    mode: "Icon size drift",
    symptom: "Icons at 14, 15, 16, 18 px scattered across the same header.",
    rule: "Inside sm buttons = 14. Default buttons = 16. Section icons = 20. Everything else snaps to one of these.",
  },
  {
    category: "Overlay",
    mode: "Popover alignment",
    symptom: "Same trigger opens popover align=start on one page, align=end on another.",
    rule: "Trigger on the left of viewport = align='start'. Right-anchored trigger = align='end'.",
  },
  {
    category: "Overlay",
    mode: "Drawer width",
    symptom: "Drawers coming in at different widths for the same content role.",
    rule: "Primary drawer = 960px. Secondary drawer next to it = 720px. Sheet = 480px.",
  },
  {
    category: "Copy",
    mode: "Verb drift",
    symptom: "Save vs Update vs Confirm on the same primary action across similar dialogs.",
    rule: "Choose one verb per action family and use it everywhere: Save, Create, Update, Delete.",
  },
  {
    category: "Copy",
    mode: "Placeholder drift",
    symptom: "'Search…' vs 'Type to search' vs 'Enter query' in visually identical inputs.",
    rule: "'Search {things}…' for search inputs. 'Select…' for selectors. 'e.g. …' for guided inputs.",
  },
  {
    category: "Data",
    mode: "Number formatting",
    symptom: "12400 shown as '12,400' in one KPI, '12.4k' in a neighbouring one.",
    rule: "Same metric column = same format. Compact (k/m) for headline KPIs, full for tables.",
  },
  {
    category: "Data",
    mode: "Date formatting",
    symptom: "'Jan 20, 2022', '20/01/22', and '2022-01-20' all in the same table.",
    rule: "Human-readable in UI = 'Jan 20, 2022' or '2h ago'. ISO only in mono for IDs/timestamps.",
  },
  {
    category: "Data",
    mode: "Currency placement",
    symptom: "₹1,248.50 in one place, 1,248.50 ₹ in another.",
    rule: "Prefix the symbol: ₹1,248.50. Always two decimals. Always tabular-nums.",
  },
  {
    category: "Accessibility",
    mode: "Focus ring drift",
    symptom: "Custom hover but no visible focus-visible outline — keyboard users lose their place.",
    rule: "Every interactive element gets focus-visible:ring-3 focus-visible:ring-ring/50.",
  },
  {
    category: "Accessibility",
    mode: "Missing aria-label",
    symptom: "Icon-only buttons that scream at a screen reader.",
    rule: "Icon-only button = aria-label matching the visible action.",
  },
];

function DriftTable() {
  const categories = Array.from(new Set(OTHER_DRIFTS.map((d) => d.category)));
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <div className="text-sm font-semibold text-foreground">
          Every other drift, and its guardrail
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {OTHER_DRIFTS.length} more modes. Grouped by axis. Read the rule
          before writing new UI in that axis.
        </p>
      </div>
      {categories.map((cat) => (
        <div key={cat} className="border-b border-border last:border-b-0">
          <div className="border-b border-border bg-background px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {cat}
          </div>
          <ul className="divide-y divide-border">
            {OTHER_DRIFTS.filter((d) => d.category === cat).map((d) => (
              <li key={d.mode} className="grid gap-x-6 gap-y-1 px-5 py-3 sm:grid-cols-[180px_1fr_1fr]">
                <div className="text-sm font-medium text-foreground">{d.mode}</div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <span className="mr-1 font-medium text-destructive">Slips as:</span>
                  {d.symptom}
                </div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <span className="mr-1 font-medium text-foreground">Rule:</span>
                  {d.rule}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── Actions ───────────────────────────────────────────────────────── */

function ActionsSection() {
  return (
    <Section id="actions" title="Actions" desc="Button, ButtonGroup, Toggle.">
      <Demo title="Button — variants">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </Demo>
      <Demo title="Button — sizes">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button>default</Button>
        <Button size="icon" aria-label="Settings">
          <Settings />
        </Button>
      </Demo>
      <Demo title="ButtonGroup">
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </Demo>
      <Demo title="Toggle · ToggleGroup">
        <Toggle aria-label="Bold">B</Toggle>
        <ToggleGroup defaultValue={["left"]}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </Demo>
    </Section>
  );
}

/* ── Badges ────────────────────────────────────────────────────────── */

function BadgesSection() {
  return (
    <Section id="badges" title="Badges">
      <Demo title="Badge — variants">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </Demo>
      <Demo title="Status pills — token colors">
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium text-foreground">
          <span className="size-1.5 rounded-full " /> Running
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium text-foreground">
          <span className="size-1.5 rounded-full " /> Backlogged
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
          <span className="size-1.5 rounded-full bg-destructive" /> Failed
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium text-foreground">
          <span className="size-1.5 rounded-full " /> Info
        </span>
      </Demo>
    </Section>
  );
}

/* ── Inputs ────────────────────────────────────────────────────────── */

function InputsSection() {
  return (
    <Section id="inputs" title="Inputs" desc="Input, Textarea, NumberStepper, Label.">
      <Demo title="Input + Label">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="c-name">Name</Label>
          <Input id="c-name" placeholder="Enter your name" />
        </div>
      </Demo>
      <Demo title="Input — disabled / invalid">
        <Input placeholder="Disabled" disabled />
        <Input placeholder="Invalid" aria-invalid />
      </Demo>
      <Demo title="Textarea">
        <Textarea placeholder="Write a note…" className="w-full" />
      </Demo>
      <Demo title="NumberStepper">
        <NumberStepper value={4} min={1} max={10} onChange={() => {}} />
      </Demo>
    </Section>
  );
}

/* ── Selection ─────────────────────────────────────────────────────── */

function SelectionSection() {
  const [slider, setSlider] = React.useState<number[]>([32]);
  return (
    <Section
      id="selection"
      title="Selection"
      desc="Checkbox, Radio, Switch, Slider."
    >
      <Demo title="Checkbox">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox defaultChecked /> I agree
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox /> Send updates
        </label>
      </Demo>
      <Demo title="RadioGroup">
        <RadioGroup defaultValue="standard">
          {["standard", "priority", "urgent"].map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm capitalize">
              <RadioGroupItem value={v} /> {v}
            </label>
          ))}
        </RadioGroup>
      </Demo>
      <Demo title="Switch">
        <label className="flex items-center gap-2 text-sm">
          <Switch defaultChecked /> Auto-retry
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch /> Email me
        </label>
      </Demo>
      <Demo title="Slider">
        <div className="w-full">
          <Slider value={slider} onValueChange={(v) => setSlider(Array.isArray(v) ? v : [v])} min={0} max={100} />
          <div className="mt-2 text-xs text-muted-foreground">value: {slider[0]}</div>
        </div>
      </Demo>
    </Section>
  );
}

/* ── Pickers ───────────────────────────────────────────────────────── */

function PickersSection() {
  const [one, setOne] = React.useState("a1");
  const [many, setMany] = React.useState<string[]>(["a1"]);
  const [sel, setSel] = React.useState("light");
  return (
    <Section
      id="pickers"
      title="Pickers"
      desc="Select, Combobox-based SearchSelect, MultiSearchSelect."
    >
      <Demo title="Select (native)">
        <Select value={sel} onValueChange={(v) => v && setSel(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </Demo>
      <Demo title="SearchSelect (searchable single)">
        <SearchSelect
          className="w-64"
          value={one}
          onChange={setOne}
          options={AGENTS}
          icon={<Bot size={14} />}
          placeholder="Pick an agent"
        />
      </Demo>
      <Demo title="MultiSearchSelect" wide>
        <MultiSearchSelect
          className="w-full max-w-md"
          value={many}
          onChange={setMany}
          options={AGENTS}
          icon={<Bot size={14} />}
          placeholder="Pick agents"
        />
      </Demo>
    </Section>
  );
}

/* ── Overlays ──────────────────────────────────────────────────────── */

function OverlaysSection() {
  return (
    <Section
      id="overlays"
      title="Overlays"
      desc="Dialog, AlertDialog, Sheet, Popover, Tooltip, HoverCard, DropdownMenu."
    >
      <Demo title="Dialog">
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will replace the current draft.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Demo>
      <Demo title="AlertDialog">
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive">Delete</Button>} />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
              <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Demo>
      <Demo title="Sheet (side drawer)">
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet</SheetTitle>
              <SheetDescription>Slides in from the side.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </Demo>
      <Demo title="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
          <PopoverContent className="w-64">
            <div className="text-sm text-foreground">Popover content</div>
            <p className="mt-1 text-xs text-muted-foreground">Any React node fits here.</p>
          </PopoverContent>
        </Popover>
      </Demo>
      <Demo title="Tooltip">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Info"><Info /></Button>} />
          <TooltipContent>Hint on hover</TooltipContent>
        </Tooltip>
      </Demo>
      <Demo title="HoverCard">
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link">@support</Button>} />
          <HoverCardContent className="w-56">
            <div className="flex items-center gap-2">
              <Avatar className="size-8"><AvatarFallback>S</AvatarFallback></Avatar>
              <div>
                <div className="text-sm font-medium">Support Bot</div>
                <div className="text-xs text-muted-foreground">Voice · en_us</div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Demo>
      <Demo title="DropdownMenu">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline">Actions</Button>} />
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Manage</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>Include drafts</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Demo>
    </Section>
  );
}

/* ── Navigation ────────────────────────────────────────────────────── */

function NavigationSection() {
  const [range, setRange] = React.useState("7d");
  return (
    <Section
      id="navigation"
      title="Navigation"
      desc="Tabs, Breadcrumb, Pagination, RangeTabs, NewMenu."
    >
      <Demo title="Tabs">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-3 text-sm text-muted-foreground">
            Overview content.
          </TabsContent>
          <TabsContent value="metrics" className="mt-3 text-sm text-muted-foreground">
            Metrics content.
          </TabsContent>
          <TabsContent value="calls" className="mt-3 text-sm text-muted-foreground">
            Calls content.
          </TabsContent>
        </Tabs>
      </Demo>
      <Demo title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/campaigns">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Q3 Win-back</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Demo>
      <Demo title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Demo>
      <Demo title="RangeTabs (custom)">
        <RangeTabs value={range} onChange={setRange} />
      </Demo>
      <Demo title="NewMenu (custom)">
        <NewMenu
          items={[
            { label: "New campaign", description: "Batch or realtime", icon: <Phone size={15} /> },
            { label: "New agent", description: "Voice agent", icon: <Bot size={15} /> },
            { label: "Upload batch", description: "QA calls", icon: <Upload size={15} /> },
          ]}
        />
      </Demo>
    </Section>
  );
}

/* ── Data display ──────────────────────────────────────────────────── */

function DataSection() {
  return (
    <Section
      id="data"
      title="Data display"
      desc="Card, Avatar, Table, Separator, KpiCard, MiniBar."
    >
      <Demo title="Card" wide>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Support Bot</CardTitle>
            <CardDescription>Voice · en_us</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deployed 2h ago. Handling 12 active calls.
            </p>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Test</Button>
          </CardFooter>
        </Card>
      </Demo>
      <Demo title="Avatar">
        <Avatar>
          <AvatarImage src="" alt="" />
          <AvatarFallback>HO</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>VD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      </Demo>
      <Demo title="Separator">
        <div className="w-full">
          <div className="text-sm text-foreground">Section A</div>
          <Separator className="my-3" />
          <div className="text-sm text-foreground">Section B</div>
        </div>
      </Demo>
      <Demo title="Table" wide>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Calls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Q3 Win-back</TableCell>
              <TableCell className="text-muted-foreground">Debt Outbound</TableCell>
              <TableCell className="text-right tabular-nums">482</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Real Estate</TableCell>
              <TableCell className="text-muted-foreground">Support Bot</TableCell>
              <TableCell className="text-right tabular-nums">120</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Demo>
      <Demo title="KpiCard (custom)">
        <KpiCard label="Calls placed" value="12,412" delta={{ value: "+8.2%", up: true }} />
      </Demo>
      <Demo title="MiniBar (custom)">
        <div className="w-full space-y-2">
          <MiniBar pct={0.72} />
          <MiniBar pct={0.24} />
          <MiniBar pct={0.95} barClassName="" />
        </div>
      </Demo>
    </Section>
  );
}

/* ── Feedback ──────────────────────────────────────────────────────── */

function FeedbackSection() {
  return (
    <Section
      id="feedback"
      title="Feedback"
      desc="Alert, Progress, Spinner, Skeleton, EmptyState, Sonner toasts."
    >
      <Demo title="Alert" wide>
        <Alert className="w-full">
          <Info />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Balance is low — top up before 5pm.</AlertDescription>
        </Alert>
        <Alert variant="destructive" className="w-full">
          <Bell />
          <AlertTitle>Campaign failed</AlertTitle>
          <AlertDescription>Provider returned 503 · retrying.</AlertDescription>
        </Alert>
      </Demo>
      <Demo title="Progress">
        <div className="w-full space-y-2">
          <Progress value={62}>
            <ProgressTrack>
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
          <div className="text-xs text-muted-foreground">62%</div>
        </div>
      </Demo>
      <Demo title="Spinner">
        <Spinner className="text-muted-foreground" />
        <Spinner className="size-6 text-foreground" />
      </Demo>
      <Demo title="Skeleton">
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Demo>
      <Demo title="EmptyState" wide>
        <EmptyState
          icon={<Search size={18} />}
          title="No results"
          description="Try a different search or filter."
          action={<Button size="sm">Reset filters</Button>}
        />
      </Demo>
      <Demo title="Sonner toast">
        <Button
          variant="outline"
          onClick={() => toast.success("Saved successfully")}
        >
          Show toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Something went wrong")}
        >
          Show error
        </Button>
      </Demo>
    </Section>
  );
}

/* ── Content ───────────────────────────────────────────────────────── */

function ContentSection() {
  const [open, setOpen] = React.useState(false);
  return (
    <Section
      id="content"
      title="Content"
      desc="Accordion, Collapsible, Kbd."
    >
      <Demo title="Accordion" wide>
        <Accordion className="w-full">
          <AccordionItem value="a">
            <AccordionTrigger>Is my data encrypted?</AccordionTrigger>
            <AccordionContent>Yes, in transit and at rest.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Can I export calls?</AccordionTrigger>
            <AccordionContent>CSV + audio zip from any campaign detail page.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Demo>
      <Demo title="Collapsible">
        <Collapsible open={open} onOpenChange={setOpen} className="w-full">
          <CollapsibleTrigger render={<Button variant="outline" size="sm"><ChevronRight className={cn("transition-transform", open && "rotate-90")} /> Details</Button>} />
          <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
            Hidden content revealed on open.
          </CollapsibleContent>
        </Collapsible>
      </Demo>
      <Demo title="Kbd">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </Demo>
    </Section>
  );
}

/* ── Feature ───────────────────────────────────────────────────────── */

function FeatureSection() {
  return (
    <Section
      id="feature"
      title="Feature components"
      desc="Higher-level pieces we've built on top of the primitives."
    >
      <Demo title="PageHeading (custom)" wide>
        <div className="w-full">
          <PageHeading
            title="Campaigns"
            desc="Manage every dialing campaign in this workspace."
          >
            <Button variant="outline" size="sm">Refresh</Button>
            <Button size="sm"><Plus /> Create</Button>
          </PageHeading>
        </div>
      </Demo>
      <Demo title="Icon set (Lucide)">
        {[Home, Search, Bell, Settings, Mail, Cog, MessageSquare, User, Star, ArrowRight, CalendarIcon, Check].map((Icon, i) => (
          <span key={i} className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground">
            <Icon size={15} />
          </span>
        ))}
      </Demo>
    </Section>
  );
}
