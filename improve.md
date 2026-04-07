## 🛠️ Bug Fix & Improvement Prompt for PuzzleCraft

---

### 🐛 Critical Bugs to Fix

#### 1. Puzzle Pieces Do NOT Connect (Most Critical)
- Currently, when pieces are dragged close to each other or to their correct position,
  nothing happens — they do not snap, connect, or lock together.
- **Fix:** Implement a snap-to-connect system. When a piece is dragged within a
  threshold distance (e.g. 20–30px) of its correct neighboring position, it should
  automatically snap and lock into place with the adjacent piece(s).
- Once two or more pieces are connected, they must move together as a single group
  when dragged.
- When ALL pieces are correctly connected, trigger the puzzle completion event
  (celebration animation + proceed to Frame step).
- This must work for ALL shape types: Classic Jigsaw AND Simple Grid (Square).

#### 2. Grid Size Option Is Not Working
- Selecting 4×4, 8×8, etc. has no effect — the puzzle does not change its piece count.
- **Fix:** The grid size selection must directly control how many pieces the image is
  sliced into. A 4×4 selection must produce exactly 16 pieces. An 8×8 must produce
  64 pieces. Rebuild the puzzle generation logic so grid size is strictly respected.

#### 3. Piece Shape Option Is Not Working
- Selecting Jigsaw vs Square vs Diamond has no effect on the actual piece shapes.
- **Fix:** The shape selector must dynamically change how pieces are cut and rendered
  on the Canvas. Jigsaw = interlocking tabs/blanks using SVG/Canvas bezier curves.
  Square = clean straight-edge grid cuts. Shape must visually apply to every piece.

#### 4. Hint Button Is Not Working
- Clicking the Hint button does nothing.
- **Fix:** When the Hint button is pressed and held (or clicked), display the original
  full image as a semi-transparent overlay (opacity ~0.4) on top of the puzzle canvas.
  The overlay should disappear after 2–3 seconds or when the user releases the button.

---

### 🔧 Improvements

#### 5. Remove Diamond Shape Option
- Remove "Diamond" from the piece shape selector entirely.
- Keep only two options: **Classic Jigsaw** and **Simple Grid (Square)**.

#### 6. Make the Puzzle Solving Board Much Larger
- The current solve canvas/board is too small and cramped.
- **Fix:** The puzzle board should fill the majority of the viewport — at minimum
  80vh height and 90vw width on desktop. On mobile it should be full-width and
  at least 70vh tall. Pieces must be sized proportionally to the board, not tiny.

---

### ✅ Summary Checklist for Developer
- [ ] Pieces snap & lock when dragged close to correct position
- [ ] Connected pieces move together as a group
- [ ] Puzzle completion triggers when all pieces are placed
- [ ] Grid size (4×4, 8×8, etc.) correctly controls piece count
- [ ] Jigsaw shape renders with real interlocking bezier tab/blank curves on Canvas
- [ ] Square shape renders with clean straight-edge cuts
- [ ] Diamond shape option removed from UI
- [ ] Hint button shows semi-transparent original image overlay on press
- [ ] Solve board is significantly larger (min 80vh × 90vw on desktop)
- [ ] All fixes tested across all grid size + shape combinations