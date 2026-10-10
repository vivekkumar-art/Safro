// ==============================================================================
// SAFRO NOTIFICATION AUDIO & VIBRATION SYNTHESIZER
// Generates distinct, native-quality acoustic notification sounds via Web Audio API
// ==============================================================================

class NotificationSoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      return this.audioCtx;
    } catch (e) {
      return null;
    }
  }

  /**
   * Plays custom synthesized sound based on category
   */
  public playSound(category: 'navigation' | 'safety' | 'general' | 'updates' | 'credit' | 'offer' | 'success'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (category === 'navigation') {
        // Melodic triple chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
        this.playToneSequence(ctx, [
          { freq: 523.25, start: now, dur: 0.12, type: 'sine', gain: 0.25 },
          { freq: 659.25, start: now + 0.1, dur: 0.12, type: 'sine', gain: 0.28 },
          { freq: 783.99, start: now + 0.2, dur: 0.35, type: 'triangle', gain: 0.32 },
        ]);
      } else if (category === 'safety') {
        // Urgent alternating alert chord: 740Hz + 880Hz pulsing
        this.playToneSequence(ctx, [
          { freq: 740.0, start: now, dur: 0.15, type: 'sawtooth', gain: 0.2 },
          { freq: 880.0, start: now + 0.16, dur: 0.15, type: 'sawtooth', gain: 0.22 },
          { freq: 740.0, start: now + 0.34, dur: 0.15, type: 'sawtooth', gain: 0.2 },
          { freq: 880.0, start: now + 0.5, dur: 0.3, type: 'sawtooth', gain: 0.25 },
        ]);
      } else if (category === 'credit' || category === 'success') {
        // Joyful ascending arpeggio
        this.playToneSequence(ctx, [
          { freq: 523.25, start: now, dur: 0.1, type: 'sine', gain: 0.2 },
          { freq: 659.25, start: now + 0.08, dur: 0.1, type: 'sine', gain: 0.22 },
          { freq: 783.99, start: now + 0.16, dur: 0.12, type: 'sine', gain: 0.25 },
          { freq: 1046.5, start: now + 0.25, dur: 0.4, type: 'triangle', gain: 0.3 },
        ]);
      } else {
        // Modern crisp two-tone bell chime: D5 (587Hz) -> A5 (880Hz)
        this.playToneSequence(ctx, [
          { freq: 587.33, start: now, dur: 0.14, type: 'sine', gain: 0.22 },
          { freq: 880.0, start: now + 0.12, dur: 0.35, type: 'sine', gain: 0.25 },
        ]);
      }
    } catch (e) {
      // Audio playback silently catches if blocked by browser policy
    }
  }

  private playToneSequence(
    ctx: AudioContext,
    tones: Array<{ freq: number; start: number; dur: number; type: OscillatorType; gain: number }>
  ): void {
    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = tone.type;
      osc.frequency.setValueAtTime(tone.freq, tone.start);

      // Envelope: gentle attack & exponential decay
      gainNode.gain.setValueAtTime(0.001, tone.start);
      gainNode.gain.linearRampToValueAtTime(tone.gain, tone.start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, tone.start + tone.dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(tone.start);
      osc.stop(tone.start + tone.dur + 0.05);
    });
  }

  /**
   * Vibrates the physical device using navigator.vibrate if supported
   */
  public triggerVibration(category: 'navigation' | 'safety' | 'general' | 'updates' | 'credit' | 'offer' | 'success'): void {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    try {
      if (category === 'safety') {
        // High urgency alert pattern
        navigator.vibrate([300, 100, 300, 100, 400]);
      } else if (category === 'navigation') {
        // Navigation directional pulse
        navigator.vibrate([200, 100, 200]);
      } else if (category === 'credit' || category === 'success') {
        navigator.vibrate([100, 50, 150]);
      } else {
        // Standard single pulse
        navigator.vibrate([150]);
      }
    } catch (e) {
      // Vibration not permitted or device unsupported
    }
  }
}

export const notificationSoundService = new NotificationSoundService();
