# Agent Builder — Reference Spec

A running record built from screenshots the user provides. Each entry = one
screenshot.

## ⚠️ Two kinds of references — do not confuse

- **CURRENT PRODUCT (to redesign)** → **REF-1 … REF-9.** These are screenshots
  of the *existing* product. They define the **functional requirements** — every
  node type, field, and behaviour we must keep — but their **visual design is
  what we're replacing.** Do NOT copy their look; copy their *functionality*.
- **DESIGN TARGET (inspiration)** → **REF-10, REF-11.** These are the look &
  feel we're moving *toward*. REF-11 (dark, glassy, typed colored ports) is the
  edit-mode aesthetic; REF-10 (status pills + model/token/duration metadata) is
  the run/monitor mode.

So: **keep the capabilities of REF-1..9, but render them in the style of
REF-10/11.** When they conflict, functional truth = REF-1..9, visual truth =
REF-10/11.

Stack: React Flow v12 (`@xyflow/react`) on the dark design system. Canvas lives
at `app/agents/new/page.tsx`. Flow is **horizontal**, **cyclic** (forward +
backward transitions), floating edges.

Status legend: ✅ built · 🔨 partial · ⬜ todo
Tags: `[CURRENT]` = existing product to redesign · `[TARGET]` = design goal

---

## REF-1 `[CURRENT]` — Start node (expanded)

A node card in its expanded/config-on-face form.

- **Card**: dark, `rounded-xl`, hairline border. Roomy padding.
- **Category pill**: `Start` — violet pill, top-left.
- **Model selector**: `LLM` dropdown with chevron, top-right of header.
- **Title row**: filled Play icon in a rounded-md tile + `Start` title.
- **Divider** below title.
- **Transition panel** (inset sub-section, slightly recessed):
  - Row header: `Transition` label (left) + `+` add button (right).
  - **Transition row**: an empty text input, bordered, **violet focus ring**,
    with a **trash/delete icon** on the right of the field.
- **Output port**: single circle on the right edge (this node = one transition).

Notes:
- Transitions are **editable inline on the node** (text input per transition),
  not only on the edge. → conflicts with REF (earlier "on-edge label") canvas;
  this product edits the condition **in the node** AND shows it on the edge.
- Model picker (`LLM`) lives in the node header.

Status: 🔨 (have a Start node; needs inline editable transition input + trash +
LLM header select + inset transition panel)

---

## REF-2 `[CURRENT]` — Node inspector · "Description" tab

A right-side inspector panel that opens for a node (looks like an Action / AI
conversation node). Full-height drawer over the canvas.

- **Tabs**: `Description` (active, blue outline) | `Tool`.
- **Description**: label + multiline textarea.
- **Message** section:
  - Helper: "What the agent says when transitioning to the next node."
  - Dropdown: `Fixed` (message mode — Fixed / likely Dynamic/Prompt).
  - Text input, placeholder "Sure, let me look that up for you."
- **Transition back to start**: dropdown, value `false` (true/false) — i.e. an
  explicit **loop-to-start** toggle (relevant to our cyclic-flow requirement).
- **Divider**.
- **Parameters** section:
  - Helper: "Log specific info collected in current node to system."
  - `+ Add Parameter` button.

Status: ⬜ (InspectorPanel not built)

---

## REF-3 `[CURRENT]` — Node inspector · "Tool" tab

Second tab of the same inspector.

- **Tabs**: `Description` | `Tool` (active).
- **Tool** section:
  - `+ Create new tool` button (top-right).
  - `Select a tool` dropdown (pick an existing tool).
- Otherwise empty until a tool is selected.

Status: ⬜

---

## REF-4 `[CURRENT]` — Transition rows + per-transition ports + states

Zoom on a node's Transition section showing multiple transitions and states.

- **Node border is red** — selected-with-error (or invalid) state.
- **Transition panel**: `Transition` label + `+`.
- **Two transition rows**, each an input with a **trash icon**:
  - Row 1: **red/pink border** (error / unmatched).
  - Row 2: **violet border** (valid / focused).
- **Two output ports** on the right edge — **one port per transition row**,
  vertically aligned to each row.

Confirms:
- **Port-per-transition** (each transition row owns its own right-side handle).
- **Per-row validation coloring** (red = problem, violet = ok/active).
- **Node-level error state** = red card border.

Status: 🔨 (per-transition ports existed in the Synthflow build; need to bring
back inline editable rows + trash + per-row validation colors on current cards)

---

## REF-5 `[CURRENT]` — Static node inspector

Inspector for a **Static** (message) node.

- Top: `id: 41m03h2ncnNmEcxJoTp4` (muted, read-only node id).
- **Name**: helper "A unique label to identify this node in the flow." + input
  (`new_static`).
- **Message**: helper "Agent will play this message and immediately move to next
  node." + textarea (placeholder "Hello, how are you?").
- **Transition back to start**: helper "After playing this message, return the
  conversation to the start node." + dropdown (`false`).
- **Voice**: helper "Override the agent's voice settings for this step." +
  toggle (off). Presumably reveals voice controls when on.

Note: Static inspector Message is a **plain textarea** (no Fixed/Dynamic mode
dropdown) — differs from REF-2's Message which had a `Fixed` mode select. →
**inspectors are per-node-type**.

Status: ⬜

---

## REF-6 `[CURRENT]` — Static node (collapsed, on canvas)

The compact card form (matches our current clean cards, violet-tinted).

- `Static` violet pill, kebab (vertical 3-dots).
- Speech-bubble icon + `new_static` title.
- Input port (left) + output port (right).
- No body when collapsed — config lives in the inspector.

Status: ✅ (have equivalent; align pill/icon)

---

## REF-7 `[CURRENT]` — Condition (Logic) node (expanded, on canvas)

Logic node edits its condition **on the node face** (not just inspector).

- `Logic` violet pill, kebab.
- Condition (branch) icon + `Condition` title.
- **Name field**: input (`new_condition`).
- Divider.
- **If** / `Nested If`:
  - `Variable` dropdown · `==` operator dropdown · `string` type dropdown ·
    `Value` input. (4-part condition builder row.)
- **Else** / `Else If`.
- Ports: input left; **two outputs right** — one at the **If** row, one at the
  **Else** row (port-per-branch).

Status: 🔨 (had this in earlier build; reinstate 4-part row + 2 branch ports)

---

## REF-8 `[CURRENT]` — API node inspector · top ("API Configuration")

Inspector for an **API** node. Tallest inspector; scrolls.

- Header: `API Configuration` (muted).
- **Name**: input (`new_endpoint`).
- **Tabs**: `API` (active) | `Code`.
- **API call** section — helper "The HTTP request this node makes." +
  `Form` / `cURL` toggle (top-right):
  - **Method**: dropdown (`POST`).
  - **URL** *(required)*: input, placeholder
    `https://api.example.com/orders/${orderId}` (supports `${var}` interpolation).
  - **Headers**: key/value rows (`Content-Type` / `application/json`) + trash
    per row + `+ Add Header`.
  - **Body**: textarea (`{}`).
  - **Route via static IP**: helper "Send this request from a fixed IP:
    15.206.64.175" + toggle (off).
  - **Response variables**: helper "Pull values from the API response into named
    variables the agent can use…" + `Form` / `JSON` toggle. (continues in REF-9)

Status: ⬜

---

## REF-9 `[CURRENT]` — API node inspector · bottom (scrolled)

Continuation of REF-8.

- **Response variables** (cont.): helper "Pull values from the API response into
  named variables the agent can use. Paths are dot-paths (e.g. `data.id`,
  `items[0].name`) — not JSONPath." + `Form`/`JSON` toggle + `+ Add Variable`.
- **Behavior** section — helper "Timeout and response-summary settings.":
  - **Timeout (ms)**: number input with steppers (`15000`).
  - **Enable AI summary**: helper "A small model turns the raw response into a
    natural-language summary. Adds latency." + toggle (off).
- **Transition back to start**: dropdown (`false`).

Status: ⬜

---

## REF-10 `[TARGET]` — Agent run/monitor canvas (great node design)

A light, clean orchestration canvas showing *running* agents as nodes. Soft
shadows, hairline borders, dotted grid, single orange accent, black thin curved
edges with arrowheads. This is a **run/monitor** view (live state per node), and
its **node card design is the reference we like**.

### Node anatomy (the key part)
- **Floating status pill** above the card, top-left — colored by state:
  `Running` (blue) · `Working` (blue) · `Complete` (green). Sits half-outside
  the card's top edge.
- **Card**: white/light, `rounded-xl`, soft shadow, hairline border.
- **Header**: small round type icon + **title** ("Tax Filing", "Tax Filing
  Worksheet") + kebab `…`.
- **Type row**: `Type` label (left) → value right ("Product agent / Cam Roze",
  "Subagent agent") — agent-type + owner.
- **Model chip row**: model badge (spark icon + `Claude-Sonnet-4.6`) on the
  left, **token count** (`234 Tokens`) right-aligned. Recessed chip look.
- **Prompt** section (optional): `Prompt` label + muted prompt text in a lightly
  recessed block.
- **Output/attachment rows** (optional): `PDF` file chip, `Open Google sheet ›`
  link-row with a chevron.
- **Footer meta**: clock icon + **Duration** (`0.0 sec`).
- Small port dots on the sides.

### Surrounding patterns worth stealing
- **Rich top inspector** (selected agent): `Working` status pill, title, columns
  — CURRENT TASK · TOKEN USAGE (`84,200 tokens · ~$0.42`) · MODEL · AGENT TYPE ·
  RUNTIME (`2h 14m 08s`) · **RECENT LOG** (timestamped log timeline). Actions
  top-right: **Delete · Pause · Open Chat**.
- **Left sidebar status counts**: COMPLETE[2] · RUNNING[4] · PENDING[2] ·
  IDLE[5] · ERRORS[1]; plus Running/Installed agents lists. (agent monitor)
- **Minimap** top-right overview.
- **Bottom floating tool pill**: add · connect · hierarchy · node · table ·
  chat — a compact tool/view switcher.

### How it maps to us
- Adopt the **node card structure** (status pill + title + meta rows + footer)
  for our **live / test-run visualization mode** — status pill = active/complete
  during a test call; model+token+duration = the analytics/heatmap overlay we
  discussed. Orange accent → our single accent; light → **adapt to dark**.
- The **top inspector with token usage / runtime / recent-log** is a strong
  model for a **run-detail panel** (distinct from the edit-time config inspector).
- Bottom tool pill = the **Views switcher** we planned.

Takeaway: this is the reference for **run/monitor mode** node design + a
per-node metadata layout (model · tokens · duration · outputs). Keep it for when
we build the test-run visualization.

Status: ⬜ (reference for live/run mode + node metadata rows)

---

## REF-11 `[TARGET]` — Dark glassy node canvas (on-theme, typed ports, multiplayer)

A refined **dark** node workflow (image-gen style), dotted grid, ambient color
glow behind the key node. This is the closest to our theme and sets the visual
bar. Glassy translucent nodes, soft rounded corners, subtle inner gradients.

### Node design
- **Header**: a **colored status dot** + node title ("● Model", "● Positive",
  "● Image Generator", "● Preview Image").
- **Typed, color-coded ports**: `model` = yellow, `positive` = green,
  `negative` = red, `image` = blue. **Both ends of a connection share the
  port's color** → you can read what connects to what. Ports sit on labeled rows
  (outputs right-aligned with their label; inputs left-aligned).
- **In-node config form** (Image Generator): label-left / control-right rows —
  Randomness (text), Control mode (dropdown "Fixed"), Quality steps (stepper
  30), Prompt strength (dropdown 8.0), Sampling method (dropdown "dpm++ 2M").
- **Text nodes** (Positive/Negative): dot+title, description, and an input
  ("Type what you want to get" / "…do not want to get").
- **Output node** (Preview): renders the result image + caption inside the card.
- **Edges**: thin light curved bezier, connecting matching colored ports.
- Subtle **ambient glow / gradient** behind the important node.

### Surrounding chrome
- **Top bar**: logo · tabs `Workflow / Edit / Help` · center **workflow tabs**
  (`‹ Black bear ✕ ›`) + subtitle "image generation v.3" · right: **Queue**
  (play + dropdown), kebab, **Share**.
- **Multiplayer presence**: avatar stack (+1) top-left; **live colored cursors
  with name tags** (Paul/Kate/Mario) on the canvas.
- **Bottom-right toolbar**: expand · bookmark · copy · refresh · `2x` · `PNG` ·
  download.
- **Bottom-center command bar**: floating prompt input with tool icons + gear.

### How it maps to us (high value — it's dark)
- **This is our node aesthetic target**: glassy dark cards + colored-dot titles.
  Elevate our current flat cards toward this (subtle gradient/glow, not flat).
- **Typed colored ports** — perfect for our transitions: could color the port
  by branch/outcome (e.g. success=green, error=red, else=muted) so edges read
  themselves. Pairs with the per-transition-port model (REF-4/7).
- **In-node config rows** (label-left/control-right) — an alternative to the
  side inspector for simple nodes (Condition already does this on-face).
- **Ambient glow** behind selected/active node — cheap polish + doubles as the
  "active node" cue in run/test mode.
- Later: **multiplayer presence** (cursors/avatars) if collaboration is a goal.
- Top **workflow tabs** + **Share** + **Queue** — chrome for multi-flow +
  collaboration + run.

Takeaway: REF-11 = the **dark visual/aesthetic bar** (glassy nodes, colored
typed ports, ambient glow, presence). REF-10 = **run/monitor** node structure.
Together they define "edit look" (dark glassy) + "run look" (status pills +
metadata). Keep both.

Status: ⬜ (aesthetic target for node styling + typed colored ports)

---

## REF-12 `[CURRENT]` — Plivo builder: palette, Skills dialog, toolbar, chrome

More of the existing product (same builder as REF-1..9). Almost certainly built
on **React Flow** (dotted grid, step edges w/ mid-edge labels, zoom/undo
controls, loop edges). Keep functionality, restyle toward REF-10/11.

### Node registry — "Select Node" modal (categorized + search)
Opened by the node "+" / add. Search box on top, grouped list; each item =
colored icon tile + title + one-line description.
- **AI**: `AI conversation` (understands queries, extracts details) · `Skills`
  (analyze/generate from text, audio, image, video).
- **Conversation**: `Preset message` (sends a preset message to the customer) ·
  `End Conversation` (ends the current conversation).
- **Functions**: `Assign to human` (route to a human agent) · `Business hour`
  (check if within working hours) · `Create task` (create a task / follow-up) ·
  `HTTP request` (API request to an external service) · …(scrolls, more).
- **Trigger** (entry): `Voice Call`.
→ Node set is a **plugin registry grouped by category**, richer than our 4
types. "Functions" = extensibility bucket (handoff, business-hours, task, HTTP).

### Skills config dialog
- Fields: `Skill Type` dropdown (`Generate Image`) · `Model Provider` dropdown
  (`Dall-e-3`) · `Instructions` textarea (placeholder "ex: Generate a product
  banner…") with **attach + `{}` variable-insert** icons.
- **Inline validation**: "Instructions are required" (red).
- Footer: `Cancel` · `Save`.
→ Per-type config in a **dialog** with **required-field validation** and a
**`{}` template/variable inserter**.

### Bottom canvas toolbar (two groups)
- Left: `[−  78%  +]` zoom · undo · redo · **tidy-up / auto-layout** (grid icon).
- Right: **select tool** · **add** (`⊕`) · **duplicate** (page icon) ·
  **`Global Prompt`** (dashed pill).

### Agent-global chrome (outside the canvas)
- **Top tabs**: `Settings · Knowledge Base · Secrets · Tools · Voice
  Configuration`. The canvas owns only the **flow**; global agent config lives
  in these tabs.
- **Global Prompt**: an agent-level system prompt applied across the whole flow.

### States
- **Selected node** = gradient (pink→blue) border.
- **Invalid node** = ⚠️ warning triangle; **required field** = red helper text.

### Implications for our build
- Add a **categorized, searchable "Select Node" modal** (AI / Conversation /
  Functions / Trigger) as the add-node surface. Extend node set beyond 4:
  add Preset message, Skills, Assign-to-human, Business-hour, Create-task,
  HTTP request. (Node registry, not hardcoded types.)
- Per-type **config dialog/inspector** with **required validation** + **`{}`
  variable inserter**.
- Add agent-global **top tabs** (Settings/Knowledge Base/Secrets/Tools/Voice) +
  a **Global Prompt** — the canvas is just the flow.
- Bottom toolbar: zoom %, undo/redo, **tidy-up (elkjs)**, select/add/duplicate.

Status: ⬜ (registry + Select-Node modal + global chrome + tidy-up)

---

## Node/inspector matrix (from refs)

| Node | On-canvas face | Inspector fields |
|---|---|---|
| **Start** | Start pill · LLM select · Play · inline Transition input+trash · 1 port (REF-1) | — (model + transitions on face) |
| **Static** | Static pill · msg icon · title · 2 ports (REF-6) | Name · Message (textarea) · Transition-back-to-start · Voice toggle (REF-5) |
| **Condition/Logic** | Logic pill · name · If(Variable/op/type/Value)/Else · 2 branch ports (REF-7) | (condition on face; inspector TBD) |
| **API** | API pill · icon · title | Name · API/Code tabs · API call (Method/URL/Headers/Body/static-IP) · Response variables (dot-path, Form/JSON, Add Variable) · Behavior (Timeout, AI summary) · Transition-back-to-start (REF-8/9) |
| **AI action** (REF-2/3) | — | Description/Tool tabs · Description · Message(mode `Fixed`+text) · Transition-back-to-start · Parameters(Add Parameter) / Tool(Select+Create) |
| **End** | End pill · ban icon · title | (TBD) |

Common inspector field: **Transition back to start** (`true`/`false`) appears on
Static, API, AI-action — a shared control tied to the cyclic-flow requirement.

## Consolidated component list (updated from refs)

Nodes
- `NodeCard` shell (header: category pill + model select; title; divider) ✅/🔨
- `InlineTransitionList` — editable transition rows, `+` add, trash delete,
  **per-row port**, per-row validation color (red/violet) ⬜
- Node error state (red border) ⬜
- LLM/model selector in node header ⬜

Inspector (right drawer) — all ⬜
- `InspectorPanel` (full-height drawer, opens on node select; shows read-only
  node id at top) — **per-node-type body**
- `StaticInspector` — Name · Message(textarea) · Transition-back-to-start · Voice toggle
- `ApiInspector` — Name · API/Code tabs · API-call(Method/URL/Headers/Body/static-IP) ·
  Response-variables(dot-path, Form/JSON, Add Variable) · Behavior(Timeout, AI summary) ·
  Transition-back-to-start
- `ActionInspector` — Description/Tool tabs · Message(mode+text) · Parameters · Tool picker
- `ConditionInspector` / `EndInspector` — TBD
- Shared field components:
  - `NameField` (label + helper + input)
  - `TransitionBackToStart` (true/false select) — reused everywhere
  - `VoiceOverride` (toggle → voice settings)
  - `KeyValueRows` + `AddRowButton` (Headers, Parameters, Response variables)
  - `MethodSelect`, `UrlField`, `BodyEditor`
  - `NumberStepperField` (Timeout) — reuse existing `NumberStepper`
  - `SegmentedToggle` (Form/cURL, Form/JSON, API/Code, Description/Tool)
  - `LabeledToggle` (static IP, AI summary, Voice)
- `ToolPicker` + `CreateToolDialog`

Answered by REF-5..9
- ✅ Inspectors are **per-node-type** (not one shared form).
- ✅ `Transition back to start` (true/false) is a **shared** field across types.
- ✅ Condition is edited **on the node face** (REF-7), Static/API in the inspector.

Open questions / conflicts to confirm with user
1. Transition condition edited **in-node** (REF-1/4/7) vs **on-edge chip**
   (earlier canvas ref). → likely BOTH: edit in node, mirror label on edge. Confirm.
2. `Message` modes: Static = plain textarea; AI-action = `Fixed` dropdown +
   text. What are the other modes (Dynamic / Prompt)?
3. `Parameters` (AI-action) vs `Response variables` (API) — both "collect vars";
   are they the same concept surfaced differently?
4. Does the Condition node also have an inspector, or is the face enough?
5. `Code` tab (API) and `Tool`/`Create new tool` flows — spec TBD (need refs).
