// Sound Manager for Slot Game
// Sounds should be placed in /public/sounds/ directory

export type SoundName =
  | "spin_start"
  | "reel_tumble"
  | "win_small"
  | "win_big"
  | "bomb_explode"
  | "free_spins_start"
  | "cascade_drop"
  | "symbol_pop"
  | "button_click"
  | "coin_drop"
  | "loading_music";

class SoundManagerClass {
  private sounds = new Map<SoundName, HTMLAudioElement>();
  private muted = false;
  private volume = 0.5;
  private musicVolume = 0.3;
  private initialized = false;
  private loadingMusic: HTMLAudioElement | null = null;

  async init() {
    if (this.initialized) return;
    
    // Define sound file mappings - files go in /public/sounds/
    // Using the available sound files
    const soundFiles: Record<SoundName, string> = {
      spin_start: "/sounds/playful-casino-slot-machine-jackpot-2-183923.mp3",
      reel_tumble: "/sounds/playful-casino-slot-machine-jackpot-2-183923.mp3",
      win_small: "/sounds/level-up-bonus-sequence-2-186891.mp3",
      win_big: "/sounds/you-win-sequence-2-183949.mp3",
      bomb_explode: "/sounds/level-up-bonus-sequence-2-186891.mp3",
      free_spins_start: "/sounds/you-win-sequence-2-183949.mp3",
      cascade_drop: "/sounds/playful-casino-slot-machine-jackpot-2-183923.mp3",
      symbol_pop: "/sounds/playful-casino-slot-machine-jackpot-2-183923.mp3",
      button_click: "/sounds/playful-casino-slot-machine-jackpot-2-183923.mp3",
      coin_drop: "/sounds/level-up-bonus-sequence-2-186891.mp3",
      loading_music: "/sounds/you-win-sequence-2-183949.mp3",
    };

    // Try to load each sound (will fail silently if file doesn't exist)
    for (const [name, src] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(src);
        audio.volume = name === "loading_music" ? this.musicVolume : this.volume;
        audio.preload = "auto";
        
        // Loading music should loop
        if (name === "loading_music") {
          audio.loop = true;
          this.loadingMusic = audio;
        }
        
        audio.addEventListener('canplaythrough', () => {
          console.log(`✅ Sound loaded: ${name}`);
        });
        
        audio.addEventListener('error', () => {
          console.warn(`⚠️ Sound not found: ${name} (${src})`);
        });
        
        this.sounds.set(name as SoundName, audio);
      } catch (e) {
        console.warn(`Could not load sound: ${name}`);
      }
    }

    this.initialized = true;
    console.log("🔊 SoundManager initialized");
  }

  play(name: SoundName) {
    if (this.muted) return;
    
    const audio = this.sounds.get(name);
    if (!audio) {
      if (!this.initialized) {
        this.init();
      }
      return;
    }

    try {
      // For loading music, don't clone - just play
      if (name === "loading_music") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      
      // Clone the audio for overlapping sounds
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(() => {});
    } catch (e) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  // Start loading/intro music
  playLoadingMusic() {
    if (this.muted) return;
    
    if (this.loadingMusic) {
      this.loadingMusic.currentTime = 0;
      this.loadingMusic.volume = this.musicVolume;
      this.loadingMusic.play().catch(() => {
        console.log("Loading music autoplay blocked - waiting for user interaction");
      });
    }
  }

  // Stop loading music with fade out
  stopLoadingMusic(fadeOut = true) {
    if (!this.loadingMusic) return;
    
    if (fadeOut) {
      // Fade out over 500ms
      const fadeInterval = setInterval(() => {
        if (this.loadingMusic && this.loadingMusic.volume > 0.05) {
          this.loadingMusic.volume = Math.max(0, this.loadingMusic.volume - 0.05);
        } else {
          clearInterval(fadeInterval);
          if (this.loadingMusic) {
            this.loadingMusic.pause();
            this.loadingMusic.currentTime = 0;
            this.loadingMusic.volume = this.musicVolume;
          }
        }
      }, 50);
    } else {
      this.loadingMusic.pause();
      this.loadingMusic.currentTime = 0;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    
    // Also mute/unmute loading music if playing
    if (this.loadingMusic) {
      this.loadingMusic.muted = muted;
    }
    
    console.log(`🔊 Sound ${muted ? 'muted' : 'unmuted'}`);
  }

  isMuted() {
    return this.muted;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((audio, name) => {
      if (name !== "loading_music") {
        audio.volume = this.volume;
      }
    });
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.loadingMusic) {
      this.loadingMusic.volume = this.musicVolume;
    }
  }

  getVolume() {
    return this.volume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  toggleMute() {
    this.muted = !this.muted;
    this.setMuted(this.muted);
    return this.muted;
  }
}

// Singleton instance
export const SoundManager = new SoundManagerClass();
