/**
 * SOUND HOOK
 * React hook for game audio management
 * 
 * Provides easy-to-use audio functions for game events
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { SoundManager, SoundName } from "../SoundManager";

// ============================================
// TYPES
// ============================================

export interface SoundHookOptions {
  autoInit?: boolean;
  defaultVolume?: number;
  defaultMusicVolume?: number;
}

export interface SoundHookReturn {
  // Playback
  play: (name: SoundName) => void;
  stop: (name: SoundName) => void;
  stopAll: () => void;
  fadeOut: (name: SoundName, duration?: number) => void;
  
  // Loading music
  playLoadingMusic: () => void;
  stopLoadingMusic: (fadeOut?: boolean) => void;
  
  // Settings
  setMuted: (muted: boolean) => void;
  toggleMute: () => boolean;
  setVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  
  // State
  isMuted: boolean;
  isInitialized: boolean;
  volume: number;
  musicVolume: number;
  
  // Initialization
  init: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useSound(options: SoundHookOptions = {}): SoundHookReturn {
  const { 
    autoInit = true, 
    defaultVolume = 0.5, 
    defaultMusicVolume = 0.3 
  } = options;
  
  const [isMuted, setIsMuted] = useState(SoundManager.isMuted());
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolumeState] = useState(defaultVolume);
  const [musicVolume, setMusicVolumeState] = useState(defaultMusicVolume);
  
  const initRef = useRef(false);
  
  // Initialize on mount
  useEffect(() => {
    if (autoInit && !initRef.current) {
      initRef.current = true;
      SoundManager.init().then(() => {
        setIsInitialized(true);
        SoundManager.setVolume(defaultVolume);
        SoundManager.setMusicVolume(defaultMusicVolume);
      });
    }
  }, [autoInit, defaultVolume, defaultMusicVolume]);
  
  // Sync muted state
  useEffect(() => {
    setIsMuted(SoundManager.isMuted());
  }, []);
  
  // ==========================================
  // PLAYBACK
  // ==========================================
  
  const play = useCallback((name: SoundName) => {
    SoundManager.play(name);
  }, []);
  
  const stop = useCallback((name: SoundName) => {
    SoundManager.stop(name);
  }, []);
  
  const stopAll = useCallback(() => {
    SoundManager.stopAll();
  }, []);
  
  const fadeOut = useCallback((name: SoundName, duration: number = 300) => {
    SoundManager.fadeOut(name, duration);
  }, []);
  
  // ==========================================
  // LOADING MUSIC
  // ==========================================
  
  const playLoadingMusic = useCallback(() => {
    SoundManager.playLoadingMusic();
  }, []);
  
  const stopLoadingMusic = useCallback((fade: boolean = true) => {
    SoundManager.stopLoadingMusic(fade);
  }, []);
  
  // ==========================================
  // SETTINGS
  // ==========================================
  
  const setMuted = useCallback((muted: boolean) => {
    SoundManager.setMuted(muted);
    setIsMuted(muted);
  }, []);
  
  const toggleMute = useCallback(() => {
    const newMuted = SoundManager.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);
  
  const setVolume = useCallback((vol: number) => {
    SoundManager.setVolume(vol);
    setVolumeState(vol);
  }, []);
  
  const setMusicVolume = useCallback((vol: number) => {
    SoundManager.setMusicVolume(vol);
    setMusicVolumeState(vol);
  }, []);
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  const init = useCallback(async () => {
    await SoundManager.init();
    setIsInitialized(true);
  }, []);
  
  return {
    play,
    stop,
    stopAll,
    fadeOut,
    playLoadingMusic,
    stopLoadingMusic,
    setMuted,
    toggleMute,
    setVolume,
    setMusicVolume,
    isMuted,
    isInitialized,
    volume,
    musicVolume,
    init,
  };
}

// ============================================
// GAME EVENT SOUNDS
// ============================================

/**
 * Helper to play appropriate sound for game events
 */
export function useGameSounds() {
  const sound = useSound();
  
  const playSpinStart = useCallback(() => {
    sound.play("spin_start");
  }, [sound]);
  
  const playReelTumble = useCallback(() => {
    sound.play("reel_tumble");
  }, [sound]);
  
  const playSymbolPop = useCallback(() => {
    sound.play("symbol_pop");
  }, [sound]);
  
  const playCascadeDrop = useCallback(() => {
    sound.play("cascade_drop");
  }, [sound]);
  
  const playWin = useCallback((winMultiplier: number, bet: number) => {
    // Stop spin sounds first
    sound.stop("spin_start");
    sound.stop("reel_tumble");
    
    const winAmount = winMultiplier * bet;
    if (winAmount >= bet * 20) {
      sound.play("win_big");
    } else {
      sound.play("win_small");
    }
  }, [sound]);
  
  const playBombExplode = useCallback(() => {
    sound.stop("spin_start");
    sound.stop("reel_tumble");
    sound.play("bomb_explode");
  }, [sound]);
  
  const playFreeSpinsStart = useCallback(() => {
    sound.play("free_spins_start");
  }, [sound]);
  
  const playButtonClick = useCallback(() => {
    sound.play("button_click");
  }, [sound]);
  
  const playCoinDrop = useCallback(() => {
    sound.play("coin_drop");
  }, [sound]);
  
  return {
    ...sound,
    playSpinStart,
    playReelTumble,
    playSymbolPop,
    playCascadeDrop,
    playWin,
    playBombExplode,
    playFreeSpinsStart,
    playButtonClick,
    playCoinDrop,
  };
}

// ============================================
// EXPORTS
// ============================================

export type { SoundName };


