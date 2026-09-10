import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { soundEngine } from '../utils/soundEngine';

export const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('facility_audio_muted');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    soundEngine.setMuted(isMuted);
    try {
      localStorage.setItem('facility_audio_muted', String(isMuted));
    } catch {}
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const playClick = useCallback(() => soundEngine.playClick(), []);
  const playKeystroke = useCallback(() => soundEngine.playKeystroke(), []);
  const playAlarm = useCallback(() => soundEngine.playAlarm(), []);
  const playAccessDenied = useCallback(() => soundEngine.playAccessDenied(), []);
  const playUnlock = useCallback(() => soundEngine.playUnlock(), []);
  const playChime = useCallback(() => soundEngine.playChime(), []);
  const playHeartbeat = useCallback(() => soundEngine.playHeartbeat(), []);
  const playPneumaticDoor = useCallback(() => soundEngine.playPneumaticDoor(), []);

  const value = useMemo(
    () => ({
      isMuted,
      toggleMute,
      playClick,
      playKeystroke,
      playAlarm,
      playAccessDenied,
      playUnlock,
      playChime,
      playHeartbeat,
      playPneumaticDoor,
    }),
    [isMuted, toggleMute, playClick, playKeystroke, playAlarm, playAccessDenied, playUnlock, playChime, playHeartbeat, playPneumaticDoor]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
