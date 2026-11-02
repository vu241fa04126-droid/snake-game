class SoundSystem {
    ctx = null;
    isMuted = false;
    volume = 0.3;
    constructor() {
        const savedMute = localStorage.getItem('serpentis_sound_muted');
        if (savedMute !== null) {
            this.isMuted = savedMute === 'true';
        }
    }
    initContext() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { });
        }
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('serpentis_sound_muted', String(this.isMuted));
        if (!this.isMuted) {
            this.playEat(false);
        }
        return this.isMuted;
    }
    getMuted() {
        return this.isMuted;
    }
    playTurn() {
        if (this.isMuted)
            return;
        this.initContext();
        if (!this.ctx)
            return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
            gain.gain.setValueAtTime(this.volume * 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        }
        catch {
            // AudioContext safe fail
        }
    }
    playEat(isSpecial = false) {
        if (this.isMuted)
            return;
        this.initContext();
        if (!this.ctx)
            return;
        try {
            const now = this.ctx.currentTime;
            if (isSpecial) {
                // Melodic golden apple chord: C5 -> E5 -> G5 -> C6
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                    if (!this.ctx)
                        return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const noteTime = now + idx * 0.05;
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, noteTime);
                    gain.gain.setValueAtTime(this.volume * 0.35, noteTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(noteTime);
                    osc.stop(noteTime + 0.2);
                });
            }
            else {
                // Sweet standard apple pop
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
                gain.gain.setValueAtTime(this.volume * 0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
            }
        }
        catch {
            // AudioContext safe fail
        }
    }
    playGameOver() {
        if (this.isMuted)
            return;
        this.initContext();
        if (!this.ctx)
            return;
        try {
            const now = this.ctx.currentTime;
            // Descending sad synth buzz
            const freqs = [330, 293.66, 246.94, 185];
            freqs.forEach((freq, idx) => {
                if (!this.ctx)
                    return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const noteTime = now + idx * 0.09;
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, noteTime);
                gain.gain.setValueAtTime(this.volume * 0.25, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.16);
            });
        }
        catch {
            // AudioContext safe fail
        }
    }
    playHighScore() {
        if (this.isMuted)
            return;
        this.initContext();
        if (!this.ctx)
            return;
        try {
            const now = this.ctx.currentTime;
            // Fanfare: C5 -> E5 -> G5 -> C6
            const notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach((freq, idx) => {
                if (!this.ctx)
                    return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const t = now + idx * 0.08;
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(this.volume * 0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.4 : 0.15));
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + (idx === 3 ? 0.45 : 0.18));
            });
        }
        catch {
            // AudioContext safe fail
        }
    }
}
export const sound = new SoundSystem();
