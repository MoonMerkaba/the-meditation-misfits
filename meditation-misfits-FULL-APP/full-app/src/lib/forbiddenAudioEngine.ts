/**
 * Forbidden Frequency Audio Engine
 * Real-time audio generation using Web Audio API
 * 
 * Generates:
 * - Binaural beats with frequency sweeps
 * - Configurable noise beds (pink/brown/white)
 * - Spatial panning movement
 * - Rhythmic modulation
 */

export interface AudioEngineConfig {
  baseFrequency: number;
  binauralStart: number;
  binauralEnd: number;
  sweepDuration: number;
  noiseType: 'white' | 'pink' | 'brown' | 'none';
  noiseVolume: number;
  spatialType: 'static' | 'circular' | 'vertical' | 'alternating' | 'expanding' | 'complex';
  spatialSpeed: number;
  modulationType: 'none' | 'amplitude' | 'frequency' | 'both';
  modulationRate: number;
  modulationDepth: number;
  durationSeconds: number;
  masterVolume?: number;
  layerCount?: number;
}

export class ForbiddenAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private panners: StereoPannerNode[] = [];
  private modulationGains: GainNode[] = [];
  private isPlaying = false;
  private startTime = 0;
  private config: AudioEngineConfig | null = null;
  private animationFrame: number | null = null;
  
  private onTimeUpdate: ((currentTime: number, duration: number) => void) | null = null;
  private onEnded: (() => void) | null = null;

  setCallbacks(
    onTimeUpdate: (currentTime: number, duration: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdate = onTimeUpdate;
    this.onEnded = onEnded;
  }

  async initialize(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async start(config: AudioEngineConfig): Promise<void> {
    await this.initialize();
    if (!this.audioContext) return;

    this.config = config;
    this.stop();

    const masterVolume = config.masterVolume ?? 0.7;
    const layerCount = config.layerCount ?? 3;

    // Create master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = masterVolume;
    this.masterGain.connect(this.audioContext.destination);

    // Create binaural beat oscillators
    this.createBinauralOscillators(config, layerCount);

    // Create noise bed
    if (config.noiseType !== 'none') {
      this.createNoiseBed(config);
    }

    // Start time tracking
    this.startTime = this.audioContext.currentTime;
    this.isPlaying = true;

    this.startTimeTracking();

    // Schedule end
    setTimeout(() => {
      if (this.isPlaying) {
        this.stop();
        this.onEnded?.();
      }
    }, config.durationSeconds * 1000);
  }

  private createBinauralOscillators(config: AudioEngineConfig, layerCount: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const endTime = now + config.durationSeconds;

    for (let layer = 0; layer < Math.min(layerCount, 4); layer++) {
      const harmonic = layer + 1;
      const layerFreq = config.baseFrequency * harmonic;
      const layerVolume = 0.4 / harmonic;

      // Left channel oscillator
      const leftOsc = this.audioContext.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.value = layerFreq;

      // Right channel oscillator (with binaural offset)
      const rightOsc = this.audioContext.createOscillator();
      rightOsc.type = 'sine';
      
      // Set up frequency sweep
      if (config.sweepDuration > 0) {
        rightOsc.frequency.setValueAtTime(layerFreq + config.binauralStart, now);
        rightOsc.frequency.linearRampToValueAtTime(
          layerFreq + config.binauralEnd,
          now + config.sweepDuration
        );
      } else {
        rightOsc.frequency.value = layerFreq + config.binauralStart;
      }

      // Create panners
      const leftPanner = this.audioContext.createStereoPanner();
      leftPanner.pan.value = -1;
      
      const rightPanner = this.audioContext.createStereoPanner();
      rightPanner.pan.value = 1;

      // Create gain nodes
      const leftGain = this.audioContext.createGain();
      leftGain.gain.value = layerVolume;
      
      const rightGain = this.audioContext.createGain();
      rightGain.gain.value = layerVolume;

      // Apply spatial movement
      this.applySpatialMovement(leftPanner, rightPanner, config, now, endTime);

      // Apply modulation
      if (config.modulationType !== 'none') {
        this.applyModulation(leftGain, rightGain, config, now, endTime, layerVolume);
      }

      // Connect
      leftOsc.connect(leftGain);
      leftGain.connect(leftPanner);
      leftPanner.connect(this.masterGain);

      rightOsc.connect(rightGain);
      rightGain.connect(rightPanner);
      rightPanner.connect(this.masterGain);

      // Start
      leftOsc.start(now);
      rightOsc.start(now);
      leftOsc.stop(endTime);
      rightOsc.stop(endTime);

      this.oscillators.push(leftOsc, rightOsc);
      this.panners.push(leftPanner, rightPanner);
      this.modulationGains.push(leftGain, rightGain);
    }
  }

  private applySpatialMovement(
    leftPanner: StereoPannerNode,
    rightPanner: StereoPannerNode,
    config: AudioEngineConfig,
    startTime: number,
    endTime: number
  ): void {
    if (!this.audioContext || config.spatialType === 'static' || config.spatialSpeed === 0) return;

    const cycleDuration = 60 / config.spatialSpeed;
    const duration = endTime - startTime;
    const numCycles = Math.ceil(duration / cycleDuration);

    for (let i = 0; i <= numCycles; i++) {
      const cycleStart = startTime + (i * cycleDuration);
      if (cycleStart > endTime) break;

      switch (config.spatialType) {
        case 'circular':
          leftPanner.pan.setValueAtTime(-1, cycleStart);
          leftPanner.pan.linearRampToValueAtTime(0, cycleStart + cycleDuration * 0.25);
          leftPanner.pan.linearRampToValueAtTime(1, cycleStart + cycleDuration * 0.5);
          leftPanner.pan.linearRampToValueAtTime(0, cycleStart + cycleDuration * 0.75);
          leftPanner.pan.linearRampToValueAtTime(-1, cycleStart + cycleDuration);
          break;

        case 'alternating':
          leftPanner.pan.setValueAtTime(-1, cycleStart);
          leftPanner.pan.setValueAtTime(1, cycleStart + cycleDuration * 0.5);
          rightPanner.pan.setValueAtTime(1, cycleStart);
          rightPanner.pan.setValueAtTime(-1, cycleStart + cycleDuration * 0.5);
          break;

        case 'vertical':
          // Simulate vertical with subtle panning
          leftPanner.pan.setValueAtTime(-0.7, cycleStart);
          leftPanner.pan.linearRampToValueAtTime(-0.3, cycleStart + cycleDuration * 0.5);
          leftPanner.pan.linearRampToValueAtTime(-0.7, cycleStart + cycleDuration);
          rightPanner.pan.setValueAtTime(0.7, cycleStart);
          rightPanner.pan.linearRampToValueAtTime(0.3, cycleStart + cycleDuration * 0.5);
          rightPanner.pan.linearRampToValueAtTime(0.7, cycleStart + cycleDuration);
          break;

        case 'expanding':
          leftPanner.pan.setValueAtTime(-0.3, cycleStart);
          leftPanner.pan.linearRampToValueAtTime(-1, cycleStart + cycleDuration * 0.5);
          leftPanner.pan.linearRampToValueAtTime(-0.3, cycleStart + cycleDuration);
          rightPanner.pan.setValueAtTime(0.3, cycleStart);
          rightPanner.pan.linearRampToValueAtTime(1, cycleStart + cycleDuration * 0.5);
          rightPanner.pan.linearRampToValueAtTime(0.3, cycleStart + cycleDuration);
          break;

        case 'complex':
          const phase = (i % 4) * 0.25;
          leftPanner.pan.setValueAtTime(-1 + phase, cycleStart);
          leftPanner.pan.linearRampToValueAtTime(1 - phase, cycleStart + cycleDuration * 0.33);
          leftPanner.pan.linearRampToValueAtTime(-0.5 + phase, cycleStart + cycleDuration * 0.66);
          leftPanner.pan.linearRampToValueAtTime(-1 + phase, cycleStart + cycleDuration);
          break;
      }
    }
  }

  private applyModulation(
    leftGain: GainNode,
    rightGain: GainNode,
    config: AudioEngineConfig,
    startTime: number,
    endTime: number,
    baseVolume: number
  ): void {
    if (!this.audioContext || config.modulationRate === 0) return;

    const cycleDuration = config.modulationRate;
    const duration = endTime - startTime;
    const numCycles = Math.ceil(duration / cycleDuration);
    const modAmount = config.modulationDepth * baseVolume;

    for (let i = 0; i <= numCycles; i++) {
      const cycleStart = startTime + (i * cycleDuration);
      if (cycleStart > endTime) break;

      // Breathing modulation
      leftGain.gain.setValueAtTime(baseVolume - modAmount, cycleStart);
      leftGain.gain.linearRampToValueAtTime(baseVolume + modAmount, cycleStart + cycleDuration * 0.5);
      leftGain.gain.linearRampToValueAtTime(baseVolume - modAmount, cycleStart + cycleDuration);

      // Offset right channel
      const offset = cycleDuration * 0.1;
      rightGain.gain.setValueAtTime(baseVolume - modAmount * 0.8, cycleStart + offset);
      rightGain.gain.linearRampToValueAtTime(baseVolume + modAmount * 0.8, cycleStart + cycleDuration * 0.5 + offset);
      rightGain.gain.linearRampToValueAtTime(baseVolume - modAmount * 0.8, cycleStart + cycleDuration + offset);
    }
  }

  private createNoiseBed(config: AudioEngineConfig): void {
    if (!this.audioContext || !this.masterGain) return;

    const bufferSize = this.audioContext.sampleRate * config.durationSeconds;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      switch (config.noiseType) {
        case 'white':
          this.generateWhiteNoise(data);
          break;
        case 'pink':
          this.generatePinkNoise(data);
          break;
        case 'brown':
          this.generateBrownNoise(data);
          break;
      }
    }

    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = buffer;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = config.noiseVolume;

    const noisePanner = this.audioContext.createStereoPanner();
    
    if (config.spatialType !== 'static' && config.spatialSpeed > 0) {
      const now = this.audioContext.currentTime;
      const cycleDuration = 60 / (config.spatialSpeed * 0.5);
      const numCycles = Math.ceil(config.durationSeconds / cycleDuration);
      
      for (let i = 0; i <= numCycles; i++) {
        const cycleStart = now + (i * cycleDuration);
        noisePanner.pan.setValueAtTime(-0.3, cycleStart);
        noisePanner.pan.linearRampToValueAtTime(0.3, cycleStart + cycleDuration * 0.5);
        noisePanner.pan.linearRampToValueAtTime(-0.3, cycleStart + cycleDuration);
      }
    }

    this.noiseSource.connect(noiseGain);
    noiseGain.connect(noisePanner);
    noisePanner.connect(this.masterGain);

    this.noiseSource.start();
  }

  private generateWhiteNoise(data: Float32Array): void {
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  private generatePinkNoise(data: Float32Array): void {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  private generateBrownNoise(data: Float32Array): void {
    let lastOut = 0;
    
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }
  }

  private startTimeTracking(): void {
    const update = () => {
      if (!this.isPlaying || !this.audioContext || !this.config) return;

      const currentTime = this.audioContext.currentTime - this.startTime;
      this.onTimeUpdate?.(currentTime, this.config.durationSeconds);

      if (currentTime < this.config.durationSeconds) {
        this.animationFrame = requestAnimationFrame(update);
      }
    };

    this.animationFrame = requestAnimationFrame(update);
  }

  stop(): void {
    this.isPlaying = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.oscillators = [];

    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch (e) {}
      this.noiseSource = null;
    }

    this.panners.forEach(p => p.disconnect());
    this.panners = [];
    
    this.modulationGains.forEach(g => g.disconnect());
    this.modulationGains = [];

    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) return 0;
    return this.audioContext.currentTime - this.startTime;
  }

  destroy(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

let engineInstance: ForbiddenAudioEngine | null = null;

export function getAudioEngine(): ForbiddenAudioEngine {
  if (!engineInstance) {
    engineInstance = new ForbiddenAudioEngine();
  }
  return engineInstance;
}
