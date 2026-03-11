import { PlayerStats, Position } from '../types/game';
import { DRILLING_SECRET_KEY } from '../config/constants';

export interface SaveData {
  version: number;
  timestamp: number;
  stats: PlayerStats;
  position: Position;
  tileMap: Record<string, [number, number]>;
}

const SAVE_KEY = 'drilling-game-save';

/**
 * drilling-game 세이브 데이터 난독화 함수
 */
function obfuscate(jsonStr: string): string {
  const key = DRILLING_SECRET_KEY;
  let obfuscated = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    obfuscated += String.fromCharCode(charCode);
  }
  // 브라우저에서 base64 인코딩 (유니코드 대응을 위해 btoa(unescape(encodeURIComponent(str))) 패턴 사용)
  try {
    return btoa(unescape(encodeURIComponent(obfuscated)));
  } catch (e) {
    // btoa가 실패할 경우 (드문 경우) 단순히 반환하거나 다른 방식 시도
    return btoa(obfuscated);
  }
}

/**
 * drilling-game 세이브 데이터 복호화 함수
 */
function deobfuscate(encoded: string): string {
  const key = DRILLING_SECRET_KEY;
  let decoded = '';
  try {
    decoded = decodeURIComponent(escape(atob(encoded)));
  } catch (e) {
    decoded = atob(encoded);
  }
  
  let deobfuscated = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    deobfuscated += String.fromCharCode(charCode);
  }
  return deobfuscated;
}

export const saveManager = {
  save(data: SaveData) {
    try {
      const json = JSON.stringify(data);
      const obfuscatedStr = obfuscate(json);
      localStorage.setItem(SAVE_KEY, obfuscatedStr);
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  },

  load(): SaveData | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return null;
      const json = deobfuscate(saved);
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to load game:', e);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(SAVE_KEY);
  },

  export(data: SaveData): string {
    return obfuscate(JSON.stringify(data));
  },

  import(obfuscatedStr: string): SaveData | null {
    try {
      const json = deobfuscate(obfuscatedStr);
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to import save:', e);
      return null;
    }
  }
};
