## 🧩 Website Development Prompt

**Project Name:** PuzzleCraft *(or any name containing "Puzzle" — developer may suggest alternatives)*

---

### 🎯 Project Overview
Build a fully functional, public-facing, browser-based **image puzzle web application** using **Vanilla HTML, CSS, and JavaScript** (no frameworks). The website is an entertainment tool where anyone can upload their own photo and turn it into a playable puzzle — no login or account required.

---

### 🎨 Visual Design & Aesthetic
- **Color palette:** Strictly two colors only — `#f9f9ee` (background) and **black** (all lines, text, illustrations, UI elements)
- **Style:** Hand-drawn black line sketch / illustration aesthetic throughout — inspired by indie zine design, doodle art, and illustrated restaurant menus. All UI components (buttons, cards, borders, dividers, icons) should feel hand-sketched, not polished/digital
- **Typography:** Hand-drawn / sketch-style fonts (e.g. *Caveat*, *Architects Daughter*, *Patrick Hand*, or similar Google Fonts). Headings feel illustrated; body text stays readable
- **Illustrations:** Include black line sketch illustrations as decorative elements across all pages (similar to the Valentine's Deli website style — mountains, trees, small figures, doodles). These should feel playful and whimsical
- **Overall feel:** Warm, fun, artsy — like a hand-crafted paper puzzle come to life on screen

---

### 📄 Pages & Structure

#### 1. **Home Page**
- Hero section with the website name/logo (hand-lettered style), a short tagline, and a clear **"Start Puzzling"** CTA button
- Brief explanation of how the app works (3-step sketch illustration: Upload → Customize → Solve)
- Decorative black sketch illustrations filling the page atmosphere
- Navigation bar: Home | Play | Gallery | About

#### 2. **Play Page** *(main feature)*
**Step 1 — Upload & Configure**
- Large illustrated upload zone (drag & drop or click to browse) for user's photo
- After upload, user selects:
  - **Grid size:** 4×4, 4×8, 8×8, 8×14, 12×12, 24×24 (displayed as illustrated grid thumbnails)
  - **Piece shape:**
    - Classic Jigsaw (interlocking tabs & blanks)
    - Simple Grid (straight-cut squares/rectangles)
    - Rectangle cut
    - Diamond cut
    - *(Developer may suggest additional popular puzzle cut styles)*
  - **Difficulty level:** Easy / Medium / Hard / Expert (controls piece scatter distance, rotation, and visual aids — separate from grid size)
- **"Preview & Start"** button

**Step 2 — Scrambled Preview**
- Show the scrambled/shuffled puzzle pieces on screen before gameplay begins
- Display the original image as a small reference thumbnail in a corner
- **"Start Solving"** button to begin

**Step 3 — Puzzle Solving**
- Drag & drop pieces freely across the canvas (no auto-snap to grid)
- Live **Timer** (counting up) and **Move Counter** displayed prominently in sketch-style UI
- **Hint Button:** When held/clicked, briefly shows the original full image as a translucent overlay, then fades away
- Pieces retain their cut shape (jigsaw tabs or grid lines) visually throughout gameplay
- When puzzle is complete → trigger a completion animation (sketch/doodle style celebration)

**Step 4 — Completion & Framing**
- Completed puzzle image **retains all visible jigsaw/cut lines** on top of the photo (the lines do NOT disappear — this is intentional and part of the aesthetic)
- User selects a **vintage / ornate border frame** from a collection of hand-drawn frame options (at least 4–6 styles: floral ornate, classic Victorian, rustic woodcut, simple elegant, etc.)
- Display final stats: time taken + total moves
- **Download button** → saves the framed puzzle image as JPG/PNG to user's device

---

#### 3. **Gallery Page**
- Showcases **sample/demo puzzles** created by the website owner as inspiration
- Display in a hand-drawn card/grid layout
- Each card shows: the completed puzzle image (with jigsaw lines visible), grid size used, piece shape used
- No user submissions (no login system)

#### 4. **About Page**
- Short description of the project, its purpose, and how to use it
- Illustrated sketch decorations
- Simple, warm, friendly tone

---

### ⚙️ Technical Requirements
- **Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+) — no React, no frameworks
- **Puzzle generation:** JavaScript must dynamically slice the uploaded image into the correct grid using Canvas API, generate correct jigsaw tab/blank shapes using SVG or Canvas paths, and scatter pieces randomly on screen
- **Drag & drop:** Native JS drag-and-drop or pointer events (no libraries)
- **Jigsaw lines overlay:** After puzzle is solved, composite the piece border lines as a permanent visual layer on the final image using Canvas
- **Frame application:** Apply selected ornate frame as a border overlay onto the canvas before download
- **Image download:** Use Canvas `toDataURL()` to export final framed puzzle as JPG/PNG
- **Fully mobile responsive:** Works on all screen sizes; on mobile, drag interactions use touch events
- **No backend, no database, no login system** — 100% client-side
- **Performance:** Must handle image sizes up to at least 5MB without crashing the browser

---

### 🌐 Additional Notes
- English language only
- All fonts loaded via Google Fonts
- Favicon should be a small sketch puzzle piece icon
- Page transitions or micro-animations should feel hand-crafted (slight wobble, sketch-draw-on effects) rather than smooth/corporate
- The overall experience should feel like playing with a real physical paper puzzle — tactile, charming, and fun