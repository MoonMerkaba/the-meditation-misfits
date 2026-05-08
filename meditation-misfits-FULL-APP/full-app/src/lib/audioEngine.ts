export class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private layers: Map<string, AudioLayer> = new Map();

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
  }

  setMasterVolume(vol: number) {
    this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
  }

  addLayer(id: string, config: LayerConfig): AudioLayer {
    const layer = new AudioLayer(this.ctx, this.masterGain, config);
    this.layers.set(id, layer);
    return layer;
  }

  removeLayer(id: string) {
    const layer = this.layers.get(id);
    if (layer) {
      layer.stop();
      this.layers.delete(id);
    }
  }

  stopAll() {
    this.layers.forEach(layer => layer.stop());
    this.layers.clear();
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

export interface LayerConfig {
  type: 'pure' | 'binaural' | 'isochronic' | 'noise';
  hz?: number;
  carrier_hz?: number;
  beat_hz?: number;
  wave?: OscillatorType;
  color?: 'white' | 'pink' | 'brown';
  gain: number;
  pan: number;
  fade_ms?: number;
}

class AudioLayer {
  private ctx: AudioContext;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private sources: AudioNode[] = [];

  constructor(ctx: AudioContext, destination: AudioNode, config: LayerConfig) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.panNode = ctx.createStereoPanner();
    
    this.gainNode.connect(this.panNode);
    this.panNode.connect(destination);
    
    this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
    this.panNode.pan.setValueAtTime(config.pan, ctx.currentTime);

    this.buildSource(config);
    
    const fadeMs = config.fade_ms || 800;
    this.gainNode.gain.linearRampToValueAtTime(config.gain, ctx.currentTime + fadeMs / 1000);
  }

  private buildSource(config: LayerConfig) {
    if (config.type === 'pure') {
      const osc = this.ctx.createOscillator();
      osc.type = config.wave || 'sine';
      osc.frequency.setValueAtTime(config.hz || 440, this.ctx.currentTime);
      osc.connect(this.gainNode);
      osc.start();
      this.sources.push(osc);
    } else if (config.type === 'binaural') {
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      const merger = this.ctx.createChannelMerger(2);
      
      oscL.frequency.setValueAtTime(config.carrier_hz || 200, this.ctx.currentTime);
      oscR.frequency.setValueAtTime((config.carrier_hz || 200) + (config.beat_hz || 4), this.ctx.currentTime);
      
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(this.gainNode);
      
      oscL.start();
      oscR.start();
      this.sources.push(oscL, oscR);
    } else if (config.type === 'noise') {
      const buffer = this.createNoiseBuffer(config.color || 'white');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.gainNode);
      source.start();
      this.sources.push(source);
    }
  }

  private createNoiseBuffer(color: string): AudioBuffer {
    const len = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  setGain(gain: number) {
    this.gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
  }

  setPan(pan: number) {
    this.panNode.pan.setValueAtTime(pan, this.ctx.currentTime);
  }

  stop() {
    this.sources.forEach(src => {
      if ('stop' in src) src.stop();
    });
  }
}
