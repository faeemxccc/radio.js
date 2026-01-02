/**
 * FALLOUT GIMMICKS MODULE
 * ------------------------------------------------------------------
 * Optional immersive features:
 * - Vault-Tec Tips
 * - Terminal Personality System
 * - Fake Signal Interferences
 * - CRT Overdrive Mode
 * - Broadcast Lore Ticks
 * - Signal Drift
 * - Compliance Checks
 */

const GIMMICKS = {
    // Configuration
    config: {
        tipsEnabled: true,
        personalityEnabled: true,
        glitchEnabled: true,
        overdriveEnabled: true,
        tipsInterval: 30000, // 30 seconds
        glitchChance: 0.005,  // Low chance per tick
        loreTickInterval: 120000 + Math.random() * 60000, // 2-3 mins
        driftChance: 0.002,
        complianceCheckInterval: 600000, // 10 mins
    },

    // Data
    tips: [
        "VAULT-TEC TIP: A HAPPY DWELLER LISTENS DAILY",
        "VAULT-TEC TIP: DO NOT ADJUST YOUR SET",
        "REMINDER: RADIATED WATER MAY CAUSE GLOWING",
        "KEEP YOUR PIP-BOY CALIBRATED",
        "WAR NEVER CHANGES, BUT THE MUSIC DOES",
        "BROUGHT TO YOU BY ROBCO INDUSTRIES",
        "PLEASE STAND BY...",
        "SIGNAL STRENGTH: 98%... 99%... 100%",
        "HAPPINESS IS MANDATORY",
        "OVERSEER EYES ARE WATCHING"
    ],

    personalityMessages: [
        "SIGNAL STABLE — ENJOY THE MUSIC, CITIZEN",
        "VAULT-TEC RADIO NETWORK CONNECTED",
        "WARNING: EXCESSIVE VIBING DETECTED",
        "CALIBRATING VACUUM TUBES...",
        "FILTERING BACKGROUND RADIATION...",
        "SYNCHRONIZING WITH VAULT NETWORK..."
    ],

    loreTicks: [
        "LOCAL VAULT STATUS: NOMINAL",
        "BROADCAST RANGE: CONTINENTAL RUINS",
        "SIGNAL RELAY NODE: ACTIVE",
        "SURFACE RADIATION: ELEVATED",
        "WATER PURIFICATION CHIP: FUNCTIONAL",
        "ENCLAVE COMMS: INTERCEPTED",
        "VAULT-TEC DATA LINK: SECURE"
    ],

    init() {
        console.log("[ROBCO] Gimmicks Module Initialized");
        this.setupBootSequence();
        this.setupTips();
        this.setupOverdrive();
        this.setupEventListeners();
        this.setupLoreTicks();
        this.setupComplianceChecks();

        // Start random loops
        if (this.config.glitchEnabled) {
            setInterval(() => this.randomGlitch(), 5000);
            setInterval(() => this.randomDrift(), 3000);
        }

        // Add Terminal Wear (one-time)
        this.addTerminalWear();
    },

    setupBootSequence() {
        const btn = document.getElementById('power-btn');
        if (btn) {
            const phrases = ["INITIALIZE", "BOOT SYSTEM", "POWER ON", "ENGAGE"];
            btn.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        }
    },

    setupTips() {
        if (!this.config.tipsEnabled) return;
        const footerText = document.querySelector('.scrolling-text');

        setInterval(() => {
            if (footerText) {
                const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
                const originalText = "> VAULT-TEC CONNECTED. STAND BY FOR EMERGENCY BROADCASTS. <";
                footerText.textContent = Math.random() > 0.5
                    ? `> ${randomTip} <`
                    : originalText;
            }
        }, this.config.tipsInterval);
    },

    setupOverdrive() {
        if (!this.config.overdriveEnabled) return;

        // Secret Key Combo: Shift + O (Overdrive)
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && (e.key === 'O' || e.key === 'o')) {
                this.triggerOverdrive();
            }
        });
    },

    triggerOverdrive() {
        console.log("[ROBCO] OVERDRIVE ENGAGED");
        document.body.classList.add('crt-overdrive');

        // Show emergency alert
        this.showTemporaryMessage("!!! OVERDRIVE !!!", 5000, true);

        setTimeout(() => {
            document.body.classList.remove('crt-overdrive');
        }, 5000 + Math.random() * 3000);
    },

    randomGlitch() {
        if (Math.random() < this.config.glitchChance) {
            document.body.classList.add('signal-interference');
            setTimeout(() => {
                document.body.classList.remove('signal-interference');
            }, 200 + Math.random() * 500);
        }
    },

    randomDrift() {
        if (Math.random() < this.config.driftChance) {
            document.body.classList.add('signal-drift');
            setTimeout(() => {
                document.body.classList.remove('signal-drift');
            }, 300 + Math.random() * 400);
        }
    },

    setupLoreTicks() {
        setInterval(() => {
            if (Math.random() > 0.7) return; // Don't show every time
            const msg = this.loreTicks[Math.floor(Math.random() * this.loreTicks.length)];
            // Show in footer briefly
            const footer = document.querySelector('.scrolling-text');
            if (footer) footer.innerHTML = `<span style="opacity:0.7; color:var(--phosphor-secondary)">[LOG] ${msg}</span>`;

            // Revert eventually by next tip cycle
        }, this.config.loreTickInterval);
    },

    setupComplianceChecks() {
        setInterval(() => {
            // Fake system check
            this.showTemporaryMessage("VAULT-TEC COMPLIANCE CHECK: PASSED", 4000);
        }, this.config.complianceCheckInterval);
    },

    addTerminalWear() {
        const wear = document.createElement('div');
        wear.className = 'terminal-wear';
        document.body.appendChild(wear);
    },

    setupEventListeners() {
        // Listen for custom events from source.js
        window.addEventListener('station:change', (e) => {
            if (this.config.personalityEnabled) {
                this.handleStationReaction(e.detail.index);
            }
        });

        document.body.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('station-item')) {
                this.triggerMicroFeedback(e.target);
            }
        });
    },

    handleStationReaction(index) {
        // Basic personality message first
        this.displayPersonalityMessage();

        // Check for specific station types (basic string matching on name)
        if (typeof STATIONS_DATA !== 'undefined' && STATIONS_DATA[index]) {
            const name = STATIONS_DATA[index].name.toLowerCase();
            let reaction = "";

            if (name.includes('jazz') || name.includes('swing')) {
                reaction = "JAZZ SIGNAL — PRE-WAR NOSTALGIA CONFIRMED";
            } else if (name.includes('classical') || name.includes('symphony')) {
                reaction = "CLASSICAL MUSIC DETECTED — CULTURAL VALUE RESTORED";
            } else if (name.includes('news') || name.includes('info')) {
                reaction = "PROPAGANDA LEVELS: ANALYZING...";
            }

            if (reaction) {
                setTimeout(() => {
                    this.showTemporaryMessage(reaction, 4000);
                }, 2000); // Show after the initial system message
            }
        }
    },

    displayPersonalityMessage() {
        const msg = this.personalityMessages[Math.floor(Math.random() * this.personalityMessages.length)];
        this.showTemporaryMessage(`VAULT-MSG: ${msg}`, 3000);
    },

    showTemporaryMessage(text, duration, isAlert = false) {
        const status = document.getElementById('signal-status');
        if (!status) return;

        const originalText = status.getAttribute('data-original') || status.textContent;
        // Save original text if not already saved (assuming STANDBY/BROADCASTING states)
        if (!status.getAttribute('data-original')) {
            status.setAttribute('data-original', originalText);
        }

        status.textContent = text;
        if (isAlert) status.classList.add('emergency-alert');

        setTimeout(() => {
            status.textContent = status.getAttribute('data-original') || "BROADCASTING";
            status.classList.remove('emergency-alert');
        }, duration);
    },

    triggerMicroFeedback(element) {
        element.classList.add('interaction-flash');
        setTimeout(() => element.classList.remove('interaction-flash'), 300);
    }
};

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GIMMICKS.init();
});
