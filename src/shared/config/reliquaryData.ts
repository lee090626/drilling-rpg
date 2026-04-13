/**
 * 지옥의 8개 서클에서 획득 가능한 정수(Essence) 관련 데이터 정의입니다.
 */

export interface ReliquaryEssence {
  id: string;      // 예: circle_2_essence
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  circle: number;  // 2 ~ 9
  bonus: {
    stat: 'hp' | 'power' | 'defense' | 'luck' | 'miningSpeed' | 'moveSpeed' | 'critRate' | 'critDmg' | 'masteryExp';
    value: number; // 스택당 증가량 (평생 누적)
  };
}

export const RELIQUARY_ESSENCES: ReliquaryEssence[] = [
  {
    id: 'circle_2_essence',
    name: 'Essence of Lust',
    nameKo: '색욕의 정수',
    description: 'A flickering pink essence that pulses with raw desire.',
    descriptionKo: '원초적 욕망으로 요동치는 분홍빛 정수입니다.',
    circle: 2,
    bonus: { stat: 'moveSpeed', value: 2 }
  },
  {
    id: 'circle_3_essence',
    name: 'Essence of Gluttony',
    nameKo: '탐식의 정수',
    description: 'A murky, vile essence that smells of rot and excess.',
    descriptionKo: '부패와 과잉의 악취가 풍기는 불결한 정수입니다.',
    circle: 3,
    bonus: { stat: 'hp', value: 10 }
  },
  {
    id: 'circle_4_essence',
    name: 'Essence of Greed',
    nameKo: '탐욕의 정수',
    description: 'A shimmering gold essence that blinds the weak-willed.',
    descriptionKo: '의지가 약한 자의 눈을 멀게 하는 황금빛 정수입니다.',
    circle: 4,
    bonus: { stat: 'luck', value: 0.5 }
  },
  {
    id: 'circle_5_essence',
    name: 'Essence of Wrath',
    nameKo: '분노의 정수',
    description: 'A burning red essence that seethes with eternal rage.',
    descriptionKo: '끊이지 않는 분노로 이글거리는 핏빛 정수입니다.',
    circle: 5,
    bonus: { stat: 'critRate', value: 0.001 }
  },
  {
    id: 'circle_6_essence',
    name: 'Essence of Heresy',
    nameKo: '이단의 정수',
    description: 'A flickering violet essence that mocks divine order.',
    descriptionKo: '신의 질서를 비웃는 보랏빛 정수입니다.',
    circle: 6,
    bonus: { stat: 'masteryExp', value: 0.01 }
  },
  {
    id: 'circle_7_essence',
    name: 'Essence of Violence',
    nameKo: '폭력의 정수',
    description: 'A jagged, crimson essence that demands bloodshed.',
    descriptionKo: '살의를 갈구하는 날카로운 선혈빛 정수입니다.',
    circle: 7,
    bonus: { stat: 'power', value: 5 }
  },
  {
    id: 'circle_8_essence',
    name: 'Essence of Fraud',
    nameKo: '기만의 정수',
    description: 'A shifting, deceptive essence that clouds the truth.',
    descriptionKo: '진실을 가리는 변덕스러운 기만의 정수입니다.',
    circle: 8,
    bonus: { stat: 'luck', value: 1.0 }
  },
  {
    id: 'circle_9_essence',
    name: 'Essence of Treachery',
    nameKo: '배신의 정수',
    description: 'A freezing, dark essence that chills the soul to the core.',
    descriptionKo: '영혼까지 얼려버리는 극한의 어둠이 깃든 정수입니다.',
    circle: 9,
    bonus: { stat: 'miningSpeed', value: 0.01 }
  }
];

export const RELIQUARY_DATA = RELIQUARY_ESSENCES.reduce((acc, current) => {
  acc[current.id] = current;
  return acc;
}, {} as Record<string, ReliquaryEssence>);
