import { useContext } from 'react';
import { AudioContext } from '../context/AudioContext';

export function useSound() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useSound must be used within an AudioProvider');
  }
  return context;
}
