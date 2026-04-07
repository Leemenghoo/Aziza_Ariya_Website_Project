/**
 * Ariya — Play Page Controller
 */

class PlayController {
    constructor() {
        this.stepElements = {
            1: document.getElementById('step-1'),
            2: document.getElementById('step-2'),
            3: document.getElementById('step-3'),
            4: document.getElementById('step-4')
        };
        this.currentStep = 1;
        
        // Config state
        this.config = {
            image: null,
            gridSize: { cols: 4, rows: 4 },
            pieceShape: 'jigsaw',
            difficulty: 'medium'
        };

        this.engine = null;
        this.timer = null;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.moves = 0;

        this.hintUses = 0;
        this.maxHintUses = 5;
        this.hintCooldownMs = 6000;
        this.hintCooldownUntil = 0;
        this.hintCooldownTimer = null;

        this.init();
    }

    init() {
        this.initUpload();
        this.initSelectors();
        this.initStepButtons();
        this.initGameControls();
    }

    initUpload() {
        const zone = document.getElementById('upload-zone');
        const input = document.getElementById('image-input');

        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) this.handleFile(e.dataTransfer.files[0]);
        });

        input.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleFile(e.target.files[0]);
        });
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.config.image = img;
                this.goToStep(2);
                this.initScrambledPreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    initSelectors() {
        // Grid Size
        document.querySelectorAll('.grid-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelector('.grid-option.selected')?.classList.remove('selected');
                opt.classList.add('selected');
                const [c, r] = opt.dataset.grid.split('x').map(Number);
                this.config.gridSize = { cols: c, rows: r };
                if (this.config.image) this.initScrambledPreview();
            });
        });

        // Shape
        document.querySelectorAll('.shape-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelector('.shape-option.selected')?.classList.remove('selected');
                opt.classList.add('selected');
                this.config.pieceShape = opt.dataset.shape;
                if (this.config.image) this.initScrambledPreview();
            });
        });

        // Difficulty
        document.querySelectorAll('.difficulty-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelector('.difficulty-option.selected')?.classList.remove('selected');
                opt.classList.add('selected');
                this.config.difficulty = opt.dataset.diff;
                if (this.config.image) this.initScrambledPreview();
            });
        });
    }

    initStepButtons() {
        document.getElementById('start-solving-btn').addEventListener('click', () => {
            this.goToStep(3);
            this.startGame();
        });
    }

    initGameControls() {
        const checkBtn = document.getElementById('check-btn');
        const hintBtn = document.getElementById('hint-btn');

        if (hintBtn) {
            hintBtn.addEventListener('click', async () => {
                await this.handleHint();
            });
        }

        checkBtn.addEventListener('click', () => {
            console.log("Check Result clicked");
            if (!this.engine) return;
            const solved = this.engine.checkManualSolve();
            console.log("Solved:", solved);
            if (solved) {
                this.handleComplete();
            } else {
                // Optional: Feedback if not solved
                checkBtn.classList.add('wobble');
                setTimeout(() => checkBtn.classList.remove('wobble'), 500);
            }
        });

        // Frame Logic
        document.querySelectorAll('.frame-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelector('.frame-option.selected')?.classList.remove('selected');
                opt.classList.add('selected');
                this.updateFinalPreview(opt.dataset.frame);
            });
        });

        document.getElementById('download-btn').addEventListener('click', () => {
            const frame = document.querySelector('.frame-option.selected').dataset.frame;
            const canvas = this.engine.getFinalCanvas(frame);
            const link = document.createElement('a');
            link.download = `ariya-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });

        this.updateHintButtonState();
    }

    getHintPieceCount() {
        if (this.config.difficulty === 'easy') return 3;
        if (this.config.difficulty === 'medium') return Math.random() > 0.5 ? 2 : 3;
        if (this.config.difficulty === 'hard') return Math.random() > 0.5 ? 1 : 2;
        return 1;
    }

    updateHintButtonState() {
        const hintBtn = document.getElementById('hint-btn');
        if (!hintBtn) return;

        const now = Date.now();
        const isCoolingDown = now < this.hintCooldownUntil;
        const noUsesLeft = this.hintUses >= this.maxHintUses;
        const engineBlocked = !this.engine || this.engine.isSolved || this.currentStep !== 3;

        hintBtn.disabled = isCoolingDown || noUsesLeft || engineBlocked;
        hintBtn.classList.toggle('is-cooldown', isCoolingDown);
        hintBtn.classList.toggle('hint-used', this.hintUses > 0);

        if (engineBlocked && this.engine?.isSolved) {
            hintBtn.textContent = 'Solved';
            return;
        }

        if (noUsesLeft) {
            hintBtn.textContent = 'Hint (0 left)';
            return;
        }

        if (isCoolingDown) {
            const secs = Math.max(1, Math.ceil((this.hintCooldownUntil - now) / 1000));
            hintBtn.textContent = `Hint (${secs}s)`;
            return;
        }

        hintBtn.textContent = `Hint (${this.maxHintUses - this.hintUses} left)`;
    }

    startHintCooldown() {
        if (this.hintCooldownTimer) clearInterval(this.hintCooldownTimer);
        this.hintCooldownUntil = Date.now() + this.hintCooldownMs;
        this.updateHintButtonState();

        this.hintCooldownTimer = setInterval(() => {
            if (Date.now() >= this.hintCooldownUntil) {
                clearInterval(this.hintCooldownTimer);
                this.hintCooldownTimer = null;
                this.hintCooldownUntil = 0;
            }
            this.updateHintButtonState();
        }, 250);
    }

    async handleHint() {
        if (!this.engine || this.engine.isSolved || this.currentStep !== 3) {
            this.updateHintButtonState();
            return;
        }

        if (this.hintUses >= this.maxHintUses) {
            this.updateHintButtonState();
            return;
        }

        if (Date.now() < this.hintCooldownUntil) {
            this.updateHintButtonState();
            return;
        }

        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) hintBtn.disabled = true;

        const count = this.getHintPieceCount();
        const result = await this.engine.applyHint(count);

        if (result.applied > 0) {
            this.hintUses += 1;
            this.moves += result.applied;
            document.getElementById('move-count').textContent = this.moves;
            this.startHintCooldown();
        }

        this.updateHintButtonState();
    }

    goToStep(step) {
        Object.values(this.stepElements).forEach(el => el.classList.remove('active'));
        this.stepElements[step].classList.add('active');
        this.currentStep = step;
        
        // Update indicator
        document.querySelectorAll('.step-dot').forEach((dot, i) => {
            if (i + 1 < step) dot.className = 'step-dot done';
            else if (i + 1 === step) dot.className = 'step-dot active';
            else dot.className = 'step-dot';
        });

        this.updateHintButtonState();

        window.scrollTo(0, 0);
    }

    initScrambledPreview() {
        const container = document.getElementById('preview-container');
        container.innerHTML = '';
        
        this.engine = new PuzzleEngine('preview-container', {
            image: this.config.image,
            gridSize: this.config.gridSize,
            pieceShape: this.config.pieceShape,
            difficulty: this.config.difficulty
        });
        
        this.engine.init();
        
        // Small ref thumb
        const refThumb = document.getElementById('ref-thumb');
        refThumb.src = this.config.image.src;
    }

    startGame() {
        // Move engine to main container
        const gameContainer = document.getElementById('puzzle-container');
        gameContainer.innerHTML = '';
        
        this.engine = new PuzzleEngine('puzzle-container', {
            image: this.config.image,
            gridSize: this.config.gridSize,
            pieceShape: this.config.pieceShape,
            difficulty: this.config.difficulty,
            onMove: () => {
                this.moves++;
                document.getElementById('move-count').textContent = this.moves;
            },
            onComplete: () => this.handleComplete()
        });
        
        this.engine.init();
        
        this.moves = 0;
        this.hintUses = 0;
        this.hintCooldownUntil = 0;
        if (this.hintCooldownTimer) {
            clearInterval(this.hintCooldownTimer);
            this.hintCooldownTimer = null;
        }
        this.elapsedTime = 0;
        this.startTime = Date.now();
        document.getElementById('move-count').textContent = '0';
        this.updateHintButtonState();
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            const m = Math.floor(this.elapsedTime / 60);
            const s = this.elapsedTime % 60;
            document.getElementById('timer-val').textContent = `${m}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }

    handleComplete() {
        clearInterval(this.timer);
        this.updateHintButtonState();
        setTimeout(() => {
            this.goToStep(4);
            this.showCelebration();
            this.updateFinalStats();
            this.updateFinalPreview('none');
        }, 800);
    }

    showCelebration() {
        triggerCelebration();
        // Play sound if we had one
    }

    updateFinalStats() {
        document.getElementById('final-time').textContent = document.getElementById('timer-val').textContent;
        document.getElementById('final-moves').textContent = this.moves;
    }

    updateFinalPreview(frame) {
        const canvas = this.engine.getFinalCanvas(frame);
        const finalCanvas = document.getElementById('final-canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PlayController();
});
