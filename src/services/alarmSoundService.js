// Audio Service for Reminders and Alarms
// Uses Web Audio API oscillator synthesis for reliable, asset-free sounds

class AlarmSoundService {
    constructor() {
        this.audioCtx = null;
    }

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    /**
     * Play a gentle, elegant chime for reminders
     */
    playNotificationChime() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const notes = [587.33, 880]; // D5, A5 chime

            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);

                gain.gain.setValueAtTime(0.001, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.5);
            });
        } catch (e) {
            console.warn('Audio chime could not play:', e);
        }
    }

    /**
     * Play a more prominent, urgent 3-tone chime for imminent meetings (starting now / 5 mins)
     */
    playUrgentAlarm() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const sequence = [
                { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
                { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
                { freq: 783.99, time: 0.30, dur: 0.35 }, // G5
                { freq: 1046.50, time: 0.60, dur: 0.50 }, // C6
            ];

            sequence.forEach(({ freq, time, dur }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + time);

                gain.gain.setValueAtTime(0.001, now + time);
                gain.gain.exponentialRampToValueAtTime(0.4, now + time + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + time);
                osc.stop(now + time + dur + 0.05);
            });
        } catch (e) {
            console.warn('Urgent alarm sound could not play:', e);
        }
    }
}

export const alarmSoundService = new AlarmSoundService();
