import { Skill } from '../types/game';

export const SKILLS: { [id: string]: Skill } = {
  earthquake: {
    id: 'earthquake',
    name: '대지진',
    description: '주변 3x3 타일을 동시에 타격합니다.',
    cooldown: 10,
    type: 'active',
    effectId: 'area_mining',
  },
  hyper_drive: {
    id: 'hyper_drive',
    name: '하이퍼 드라이브',
    description: '5초 동안 채광 속도가 2배 빨라집니다.',
    cooldown: 30,
    type: 'active',
    effectId: 'speed_boost',
  },
  lucky_strike: {
    id: 'lucky_strike',
    name: '럭키 스트라이크',
    description: '타일 파괴 시 광석을 2배로 얻을 확률이 증가합니다.',
    cooldown: 0,
    type: 'passive',
    effectId: 'double_drop',
  },
};
