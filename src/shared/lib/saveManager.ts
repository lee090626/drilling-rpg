import { PlayerStats, Position, Inventory } from '../types/game';
import { DRILLING_SECRET_KEY } from '../config/constants';
import { MINERALS } from '../config/mineralData';

/**
 * 저장될 게임 데이터의 규격을 정의합니다.
 */
export interface SaveData {
  /** 데이터 버전 (호환성 체크용) */
  version: number;
  /** 저장된 시간 타임스탬프 */
  timestamp: number;
  /** 플레이어 스탯 정보 */
  stats: PlayerStats;
  /** 플레이어 현재 위치 */
  position: Position;
  /** (Legacy) 구버전 호환용 타일 맵 데이터 */
  tileMap?: Record<string, [number, number]>;
  /** (New) Buffer를 Base64로 인코딩한 타일 맵 데이터 */
  tileMapData?: string;
  /** (Memory) 저장 직전 워커로부터 전달받는 버퍼 (저장 전 인코딩용, 실제 디스크에는 기록불가) */
  tileMapBuffer?: Uint32Array;
}

const SAVE_KEY = 'drilling-game-save';

/**
 * 브라우저 로컬 저장소에 저장하기 전 데이터를 난독화합니다.
 * 비트 연산(XOR)과 Base64 인코딩을 조합하여 텍스트를 변조합니다.
 * @param jsonStr 저장할 JSON 문자열
 * @returns 난독화된 문자열
 */
function obfuscate(jsonStr: string): string {
  const key = DRILLING_SECRET_KEY;
  let obfuscated = '';
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    obfuscated += String.fromCharCode(charCode);
  }
  
  try {
    // 유니코드 안전한 Base64 인코딩 패턴
    return btoa(unescape(encodeURIComponent(obfuscated)));
  } catch (e) {
    return btoa(obfuscated);
  }
}

/**
 * 난독화된 저장 데이터를 다시 읽기 가능한 JSON 문자열로 복구합니다.
 * @param encoded 난독화된 Base64 문자열
 * @returns 복구된 원본 JSON 문자열
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

/**
 * 로컬 저장소와 세이브 데이터의 입출력을 관리하는 유틸리티입니다.
 */
export const saveManager = {
  /**
   * 새로운 데이터를 저장합니다.
   * @param data 저장할 세이브 데이터 객체
   */
  save(data: SaveData) {
    try {
      // Buffer가 존재할 경우 Base64 문자열로 인코딩
      if (data.tileMapBuffer) {
        const bytes = new Uint8Array(data.tileMapBuffer.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        data.tileMapData = btoa(binary);
        delete data.tileMapBuffer; // 디스크에 저장 불필요
      }
      
      const json = JSON.stringify(data);
      const obfuscatedStr = obfuscate(json);
      localStorage.setItem(SAVE_KEY, obfuscatedStr);
    } catch (e) {
      console.error('게임 저장 실패:', e);
    }
  },

  /**
   * 로컬 저장소에서 데이터를 불러옵니다.
   * @returns 불러온 데이터 객체 또는 데이터가 없을 시 null
   */
  load(): SaveData | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return null;
      const json = deobfuscate(saved);
      const data = JSON.parse(json);
      
      // 구 버전 데이터와의 호환성을 위한 패치 로직
      if (data.stats) {
        const s = data.stats;
        if (!s.equipmentStates) s.equipmentStates = {};
        if (!s.unlockedResearchIds) s.unlockedResearchIds = ['root'];
        if (!s.killedMonsterIds) s.killedMonsterIds = [];
        if (s.artifacts === undefined) s.artifacts = [];
        if (s.equippedArtifactId === undefined) s.equippedArtifactId = null;
        if (!s.artifactCooldowns) s.artifactCooldowns = {};
        if (!s.refinerySlots) s.refinerySlots = 1;
        if (!s.activeSmeltingJobs) s.activeSmeltingJobs = [];
        if (!s.inventoryRunes) s.inventoryRunes = [];
        if (!s.tileMastery) s.tileMastery = {};
        if (!s.unlockedMasteryPerks) s.unlockedMasteryPerks = [];
        
        // 인벤토리 누락 아이템 보정 및 레거시 데이터 마이그레이션
        if (s.inventory) {
          const validMineralKeys: Set<string> = new Set(MINERALS.map(m => m.key as string));
          const oldInv = s.inventory as any;
          s.inventory = {} as Inventory;
          
          let compensationGold = 0;
          for (const key of Object.keys(oldInv)) {
            // 명시적 마이그레이션: veinstone -> crimsonstone
            if (key === 'veinstone') {
              (s.inventory as any).crimsonstone = ((s.inventory as any).crimsonstone || 0) + oldInv[key];
              console.log(`[SaveManager] migrated 'veinstone' to 'crimsonstone'`);
              continue;
            }

            if (validMineralKeys.has(key)) {
              (s.inventory as any)[key] = oldInv[key];
            } else if (typeof oldInv[key] === 'number' && oldInv[key] > 0) {
              // 사용되지 않는 구형 광물(dirt, stone 등)은 1개당 10G로 환산
              compensationGold += oldInv[key] * 10;
            }
          }
          
          if (compensationGold > 0) {
            s.goldCoins = (s.goldCoins || 0) + compensationGold;
            console.log(`[SaveManager] Legacy items converted to ${compensationGold} Gold Coins.`);
          }

          // 신규 광물 초기화
          MINERALS.forEach(m => {
            if ((s.inventory as any)[m.key] === undefined) {
              (s.inventory as any)[m.key] = 0;
            }
          });
        }
      }
      
      return data;
    } catch (e) {
      console.error('게임 로드 실패:', e);
      return null;
    }
  },

  /**
   * 저장된 모든 데이터를 삭제합니다. (초기화용)
   */
  clear() {
    localStorage.removeItem(SAVE_KEY);
  },

  /**
   * 세이브 코드를 추출하여 외부로 내보냅니다.
   * @param data 내보낼 데이터
   * @returns 난독화된 세이브 문자열
   */
  export(data: SaveData): string {
    // Buffer가 존재할 경우 Base64 문자열로 인코딩하여 외부용 텍스트 코드로 만듦
    if (data.tileMapBuffer) {
      const bytes = new Uint8Array(data.tileMapBuffer.buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      data.tileMapData = btoa(binary);
      delete data.tileMapBuffer;
    }
    return obfuscate(JSON.stringify(data));
  },

  /**
   * 외부에서 제공받은 세이브 코드를 데이터 객체로 변환합니다.
   * @param obfuscatedStr 세이브 문자열 (코드)
   * @returns 변환된 데이터 또는 실패 시 null
   */
  import(obfuscatedStr: string): SaveData | null {
    try {
      const json = deobfuscate(obfuscatedStr);
      return JSON.parse(json);
    } catch (e) {
      console.error('세이브 데이터 임포트 실패:', e);
      return null;
    }
  }
};
