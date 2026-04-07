/**
 * Ariya — Core Puzzle Engine (V3 - Final Geometry)
 * Handles Seamless Slicing with Image-Filled Tabs and Grouping
 */

class PuzzleEngine {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.image = options.image || null;
        this.gridSize = options.gridSize || { cols: 4, rows: 4 };
        this.pieceShape = options.pieceShape || 'jigsaw';
        this.difficulty = options.difficulty || 'medium';
        
        this.pieces = [];
        this.selectedGroup = [];
        this.isSolved = false;
        this.hintInProgress = false;
        this.hintedPieceIds = new Set();
        
        this.onComplete = options.onComplete || (() => {});
        this.onMove = options.onMove || (() => {});
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initEvents();
    }

    resize() {
        const oldW = this.width;
        const oldH = this.height;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        if (this.width === 0 || this.height === 0) return;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        if (oldW > 0 && oldH > 0) {
            const dx = (this.width - oldW) / 2;
            const dy = (this.height - oldH) / 2;
            this.pieces.forEach(p => {
                p.x += dx; p.y += dy;
                p.targetX += dx; p.targetY += dy;
            });
        }
        this.draw();
    }

    async init() {
        if (!this.image) return;
        this.generatePieces();
        this.shufflePieces();
        this.draw();
    }

    generatePieces() {
        const { cols, rows } = this.gridSize;
        const sW = this.image.width / cols;
        const sH = this.image.height / rows;
        
        const scale = Math.min(
            (this.width * 0.8) / this.image.width,
            (this.height * 0.8) / this.image.height
        );
        
        this.sPieceW = sW * scale;
        this.sPieceH = sH * scale;

        const globalTargetX = (this.width - this.image.width * scale) / 2;
        const globalTargetY = (this.height - this.image.height * scale) / 2;

        this.pieces = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const topTab = r === 0 ? 0 : -this.pieces[(r - 1) * cols + c].tabs.bottom;
                const leftTab = c === 0 ? 0 : -this.pieces[r * cols + (c - 1)].tabs.right;
                const bottomTab = (this.pieceShape === 'grid' || r === rows - 1) ? 0 : (Math.random() > 0.5 ? 1 : -1);
                const rightTab = (this.pieceShape === 'grid' || c === cols - 1) ? 0 : (Math.random() > 0.5 ? 1 : -1);

                const p = {
                    id: `${c}-${r}`,
                    col: c, row: r,
                    groupId: `${c}-${r}`,
                    x: 0, y: 0,
                    targetX: globalTargetX + c * this.sPieceW,
                    targetY: globalTargetY + r * this.sPieceH,
                    width: this.sPieceW, height: this.sPieceH,
                    rotation: 0,
                    isPlaced: false,
                    tabs: {
                        top: topTab,
                        bottom: bottomTab,
                        left: leftTab,
                        right: rightTab
                    }
                };
                this.pieces.push(p);
            }
        }
    }

    shufflePieces() {
        const padding = 60;
        this.pieces.forEach(p => {
            p.x = Math.random() * (this.width - p.width - padding * 2) + padding;
            p.y = Math.random() * (this.height - p.height - padding * 2) + padding;
            if (this.difficulty === 'medium') p.rotation = (Math.random() - 0.5) * 0.2;
            if (this.difficulty === 'hard') p.rotation = (Math.random() - 0.5) * 0.8;
            if (this.difficulty === 'expert') p.rotation = Math.random() * Math.PI * 2;
        });
        this.pieces.sort(() => Math.random() - 0.5);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.pieces.forEach(p => this.drawPiece(p));
    }

    drawPiece(p) {
        const ctx = this.ctx;
        const tabSize = Math.min(p.width, p.height) * 0.25;
        
        ctx.save();
        ctx.translate(p.x + p.width/2, p.y + p.height/2);
        ctx.rotate(p.rotation);
        
        // 1. Create the detailed jigsaw path
        this.drawPiecePath(ctx, -p.width/2, -p.height/2, p.width, p.height, p.tabs, tabSize);
        
        // 2. Clip to that path
        ctx.clip();
        
        // 3. Draw image with BUFFER to fill the tabs
        // sX, sY are source top-left of the piece rectangle.
        // To fill tabs, we draw a larger portion of the image.
        const sW = this.image.width / this.gridSize.cols;
        const sH = this.image.height / this.gridSize.rows;
        const sX = p.col * sW;
        const sY = p.row * sH;
        
        const scale = p.width / sW;
        const buffer = tabSize / scale; // Buffer in source pixels
        
        ctx.drawImage(
            this.image,
            sX - buffer, sY - buffer, sW + 2 * buffer, sH + 2 * buffer,
            -p.width / 2 - tabSize, -p.height / 2 - tabSize, p.width + 2 * tabSize, p.height + 2 * tabSize
        );
        
        ctx.restore();

        // 4. Draw the outline (stroke)
        ctx.save();
        ctx.translate(p.x + p.width/2, p.y + p.height/2);
        ctx.rotate(p.rotation);
        this.drawPiecePath(ctx, -p.width/2, -p.height/2, p.width, p.height, p.tabs, tabSize);
        const hasHintGlow = p.hintUntil && Date.now() < p.hintUntil;
        ctx.strokeStyle = hasHintGlow ? '#111' : '#000';
        ctx.lineWidth = hasHintGlow ? 3 : 2;
        ctx.stroke();

        if (hasHintGlow) {
            ctx.save();
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    drawPiecePath(ctx, x, y, w, h, tabs, size) {
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Top edge
        this.drawEdge(ctx, x, y, x + w, y, tabs.top, size);
        // Right edge
        this.drawEdge(ctx, x + w, y, x + w, y + h, tabs.right, size);
        // Bottom edge
        this.drawEdge(ctx, x + w, y + h, x, y + h, tabs.bottom, size);
        // Left edge
        this.drawEdge(ctx, x, y + h, x, y, tabs.left, size);
    }

    drawEdge(ctx, x1, y1, x2, y2, tab, size) {
        if (tab === 0) {
            ctx.lineTo(x2, y2);
            return;
        }

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        const nx = dx / dist; // Tangent (along edge)
        const ny = dy / dist;
        const px = ny;        // Normal (pointing outwards)
        const py = -nx;
        
        const midX = x1 + dx * 0.5;
        const midY = y1 + dy * 0.5;

        // Extrusion vector based on tab (1 for out, -1 for in)
        const ex = px * size * tab * 0.8;
        const ey = py * size * tab * 0.8;

        // Draw to neck
        ctx.lineTo(midX - nx * size * 0.5, midY - ny * size * 0.5);
        
        // Draw bulb Left half
        ctx.bezierCurveTo(
            midX - nx * size * 0.5 - ex * 0.2, midY - ny * size * 0.5 - ey * 0.2,
            midX - nx * size * 1.2 + ex, midY - ny * size * 1.2 + ey,
            midX + ex, midY + ey
        );
        
        // Draw bulb Right half
        ctx.bezierCurveTo(
            midX + nx * size * 1.2 + ex, midY + ny * size * 1.2 + ey,
            midX + nx * size * 0.5 - ex * 0.2, midY + ny * size * 0.5 - ey * 0.2,
            midX + nx * size * 0.5, midY + ny * size * 0.5
        );
        
        ctx.lineTo(x2, y2);
    }

    // Drag and Drop Logic
    initEvents() {
        const handleStart = (e) => {
            if (this.isSolved) return;
            this.pickGroup(this.getMousePos(e));
        };
        const handleMove = (e) => {
            if (this.selectedGroup.length === 0) return;
            this.moveGroup(this.getMousePos(e));
        };
        const handleEnd = () => {
            if (this.selectedGroup.length === 0) return;
            this.releaseGroup();
        };

        this.canvas.addEventListener('mousedown', handleStart);
        this.canvas.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e.touches[0]); }, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    pickGroup(pos) {
        let pickedPiece = null;
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            if (this.isPointInPiece(pos, this.pieces[i])) {
                pickedPiece = this.pieces[i];
                break;
            }
        }
        if (pickedPiece) {
            this.selectedGroup = this.pieces.filter(p => p.groupId === pickedPiece.groupId);
            this.dragOffset = { x: pos.x, y: pos.y };
            this.selectedGroup.forEach(p => {
                p.startX = p.x; p.startY = p.y;
                // Move group to top
                const idx = this.pieces.indexOf(p);
                this.pieces.splice(idx, 1);
                this.pieces.push(p);
            });
            this.draw();
        }
    }

    isPointInPiece(pos, p) {
        return pos.x > p.x && pos.x < p.x + p.width && pos.y > p.y && pos.y < p.y + p.height;
    }

    moveGroup(pos) {
        const dx = pos.x - this.dragOffset.x;
        const dy = pos.y - this.dragOffset.y;
        this.selectedGroup.forEach(p => { p.x = p.startX + dx; p.y = p.startY + dy; });
        this.draw();
    }

    releaseGroup() {
        let snapped = false;
        for (const p of this.selectedGroup) {
            const neighbors = this.pieces.filter(n => 
                n.groupId !== p.groupId && (
                    (n.col === p.col - 1 && n.row === p.row) || (n.col === p.col + 1 && n.row === p.row) ||
                    (n.col === p.col && n.row === p.row - 1) || (n.col === p.col && n.row === p.row + 1)
                )
            );
            for (const n of neighbors) {
                const expX = n.x + (p.col - n.col) * p.width;
                const expY = n.y + (p.row - n.row) * p.height;
                if (Math.hypot(p.x - expX, p.y - expY) < 30 && Math.abs(p.rotation - n.rotation) < 0.2) {
                    const sx = expX - p.x; const sy = expY - p.y;
                    const rot = n.rotation; const gid = n.groupId;
                    this.selectedGroup.forEach(gp => { gp.x += sx; gp.y += sy; gp.rotation = rot; gp.groupId = gid; });
                    snapped = true; this.onMove(); break;
                }
            }
            if (snapped) break;
        }

        if (!snapped) {
            for (const p of this.selectedGroup) {
                const rotDiff = Math.abs(p.rotation % (Math.PI * 2));
                if (Math.hypot(p.x - p.targetX, p.y - p.targetY) < 30 && (rotDiff < 0.2 || rotDiff > Math.PI * 2 - 0.2)) {
                    const sx = p.targetX - p.x; const sy = p.targetY - p.y;
                    this.selectedGroup.forEach(gp => { gp.x += sx; gp.y += sy; gp.rotation = 0; gp.isPlaced = true; });
                    snapped = true; this.onMove(); break;
                }
            }
        }
        this.selectedGroup = [];
        this.checkSolve();
        this.draw();
    }

    checkSolve() {
        const allOne = this.pieces.every(p => p.groupId === this.pieces[0].groupId);
        if (allOne && Math.hypot(this.pieces[0].x - this.pieces[0].targetX, this.pieces[0].y - this.pieces[0].targetY) < 5) {
            this.forceSolve();
        }
    }

    checkManualSolve() {
        const allOne = this.pieces.every(p => p.groupId === this.pieces[0].groupId);
        if (allOne) {
            // If all linked, we can be more lenient or just snap it
            this.forceSolve();
            return true;
        }
        return false;
    }

    isPieceCorrect(p) {
        const rotNorm = Math.abs(p.rotation % (Math.PI * 2));
        const isRotationCorrect = rotNorm < 0.08 || rotNorm > Math.PI * 2 - 0.08;
        const isPositionCorrect = Math.hypot(p.x - p.targetX, p.y - p.targetY) < 4;
        return isPositionCorrect && isRotationCorrect;
    }

    getHintCandidatePieces() {
        return this.pieces.filter(p => !this.isPieceCorrect(p) && !this.hintedPieceIds.has(p.id));
    }

    getHintCount() {
        const candidates = this.getHintCandidatePieces();
        if (!candidates.length) return 0;

        if (this.difficulty === 'easy') {
            return Math.min(candidates.length, 3);
        }
        if (this.difficulty === 'medium') {
            return Math.min(candidates.length, 2 + Math.floor(Math.random() * 2));
        }
        return Math.min(candidates.length, 1 + Math.floor(Math.random() * 2));
    }

    pickHintPieces(count) {
        const candidates = this.getHintCandidatePieces();
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    animatePiecesToTarget(pieces, duration = 380) {
        return new Promise((resolve) => {
            if (!pieces.length) {
                resolve();
                return;
            }

            const start = performance.now();
            const initial = pieces.map(p => ({ piece: p, x: p.x, y: p.y, r: p.rotation }));

            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

            const tick = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const eased = easeOutCubic(t);

                initial.forEach(({ piece, x, y, r }) => {
                    piece.x = x + (piece.targetX - x) * eased;
                    piece.y = y + (piece.targetY - y) * eased;
                    piece.rotation = r * (1 - eased);
                });

                this.draw();

                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(tick);
        });
    }

    async applyHint(requestedCount = null) {
        if (this.isSolved || this.hintInProgress) {
            return { applied: 0, solved: this.isSolved, reason: 'blocked' };
        }

        const count = requestedCount ?? this.getHintCount();
        if (count <= 0) {
            return { applied: 0, solved: this.isSolved, reason: 'no-candidates' };
        }

        const piecesToHint = this.pickHintPieces(count);
        if (!piecesToHint.length) {
            return { applied: 0, solved: this.isSolved, reason: 'no-candidates' };
        }

        this.hintInProgress = true;
        await this.animatePiecesToTarget(piecesToHint);

        const now = Date.now();
        piecesToHint.forEach((p) => {
            p.x = p.targetX;
            p.y = p.targetY;
            p.rotation = 0;
            p.isPlaced = true;
            p.hintUntil = now + 520;
            this.hintedPieceIds.add(p.id);
        });

        this.selectedGroup = [];
        this.checkSolve();
        this.draw();

        this.hintInProgress = false;
        return { applied: piecesToHint.length, solved: this.isSolved, reason: 'ok' };
    }

    forceSolve() {
        this.isSolved = true;
        this.pieces.forEach(p => { p.x = p.targetX; p.y = p.targetY; p.rotation = 0; });
        this.draw();
        this.onComplete();
    }

    getFinalCanvas(frameStyle = 'none') {
        const padding = frameStyle === 'none' ? 0 : 60;
        const final = document.createElement('canvas');
        final.width = this.image.width + padding * 2;
        final.height = this.image.height + padding * 2;
        const ctx = final.getContext('2d');
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, final.width, final.height);
        
        ctx.drawImage(this.image, padding, padding);
        
        const sW = this.image.width / this.gridSize.cols;
        const sH = this.image.height / this.gridSize.rows;
        const tabSize = Math.min(sW, sH) * 0.25;

        // Draw subtle piece lines
        this.pieces.forEach(p => {
            const x = padding + p.col * sW; const y = padding + p.row * sH;
            ctx.save();
            ctx.translate(x + sW/2, y + sH/2);
            this.drawPiecePath(ctx, -sW/2, -sH/2, sW, sH, p.tabs, tabSize);
            ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.restore();
        });

        // Frame overlays
        if (frameStyle === 'classic') {
            ctx.strokeStyle = '#000'; ctx.lineWidth = 60;
            ctx.strokeRect(30,30, final.width-60, final.height-60);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
            ctx.strokeRect(56,56, final.width-112, final.height-112);
        } else if (frameStyle === 'ornate') {
            const gold = '#d4af37';
            ctx.strokeStyle = gold; ctx.lineWidth = 60;
            ctx.strokeRect(30,30, final.width-60, final.height-60);
            ctx.strokeStyle = '#aa841e'; ctx.lineWidth = 8;
            ctx.strokeRect(15,15, final.width-30, final.height-30);
            ctx.strokeRect(45,45, final.width-90, final.height-90);
        } else if (frameStyle === 'woodcut') {
            ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 60;
            ctx.strokeRect(30,30, final.width-60, final.height-60);
            ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 4;
            ctx.strokeRect(10,10, final.width-20, final.height-20);
            ctx.strokeRect(20,20, final.width-40, final.height-40);
            ctx.strokeRect(40,40, final.width-80, final.height-80);
            ctx.strokeRect(50,50, final.width-100, final.height-100);
        }
        
        return final;
    }
}
