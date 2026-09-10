import { useContext } from 'react';
import { GameSessionContext, SECTOR_MAP, ROOM_ID_TO_SECTOR } from '../context/GameSessionContext';

export function useGameSession() {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
}

export { SECTOR_MAP, ROOM_ID_TO_SECTOR };

