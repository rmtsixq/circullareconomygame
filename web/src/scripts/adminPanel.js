/**
 * Admin Panel for developer testing and cheats
 */
export class AdminPanel {
    constructor() {
        this.isVisible = false;
        this.#initShortcut();
    }

    /**
     * Initialize shortcut listener (CTRL + ALT + A)
     */
    #initShortcut() {
        window.addEventListener('keydown', (e) => {
            // CTRL + ALT + A to toggle
            if (e.ctrlKey && e.altKey && e.code === 'KeyA') {
                this.toggle();
            }

            // ESC to close
            if (e.code === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Toggles visibility of the admin panel
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        const el = document.getElementById('admin-panel');
        if (el) {
            el.style.display = 'flex';
            this.isVisible = true;
        }
    }

    hide() {
        const el = document.getElementById('admin-panel');
        if (el) {
            el.style.display = 'none';
            this.isVisible = false;
        }
    }

    /**
     * Cheats
     */

    addMoney(amount) {
        if (window.gameState) {
            window.gameState.addMoney(amount);
            window.ui.showNotification('💰 HİLE', `Hesaba ${amount.toLocaleString()} 💰 eklendi.`, 'success');
        }
    }

    setLevel(level) {
        if (window.gameState) {
            const oldLevel = window.gameState.level;
            window.gameState.level = level;
            // Ensure XP is enough for this level to prevent "level down" logic if it exists
            window.gameState.xp = window.gameState.xpRequirements[level] || 0;

            if (window.ui && window.ui.onLevelUp) {
                window.ui.onLevelUp(level, oldLevel);
            }
            window.ui.updateGameState(window.gameState);
            window.ui.showNotification('🆙 HİLE', `Şehir seviyesi ${level} yapıldı.`, 'success');
        }
    }

    maxScores() {
        if (window.gameState && window.scoringSystem) {
            window.gameState.wellbeing = 100;
            window.gameState.education = 100;
            window.gameState.health = 100;
            window.gameState.sustainability = 100;

            // Update target values in scoring system for smooth transition if needed
            window.scoringSystem.wellbeing = 100;
            window.scoringSystem.education = 100;
            window.scoringSystem.health = 100;
            window.scoringSystem.sustainability = 100;

            window.ui.updateGameState(window.gameState);
            window.ui.showNotification('📊 HİLE', 'Tüm şehir endeksleri %100 yapıldı.', 'success');
        }
    }

    toggleTutorial() {
        if (window.tutorialState) {
            window.tutorialState.isActive = !window.tutorialState.isActive;
            const status = window.tutorialState.isActive ? 'AKTİF' : 'KAPALI';
            window.ui.showNotification('🎓 HİLE', `Giriş eğitimi ${status} yapıldı.`, 'info');

            // If tutorial is closed, make sure welcome overlay is gone
            if (!window.tutorialState.isActive) {
                const overlay = document.getElementById('welcome-overlay');
                if (overlay) overlay.style.display = 'none';
                const root = document.getElementById('root-window');
                if (root) root.style.display = 'block';
            }
        }
    }

    unlockAll() {
        // This is abstract but we can force level 10 to unlock most things
        this.setLevel(10);
        this.addMoney(1000000);
        window.ui.showNotification('🔓 HİLE', 'Tüm kilitler açıldı ve bütçe eklendi.', 'success');
    }
}

// Global instance
window.adminPanel = new AdminPanel();
