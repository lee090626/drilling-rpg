/**
 * 숫자를 K(천), M(백만), B(십억) 단위로 요약하여 읽기 쉽게 포맷팅합니다.
 * @param value 포맷팅할 대상 숫자
 * @returns 단위를 포함한 문자열 (예: 1,500 -> 1.5K, 2,000,000 -> 2M)
 */
export const formatNumber = (value: number): string => {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  
  // 십억 단위 처리
  if (absValue >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  
  // 백만 단위 처리
  if (absValue >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  // 천 단위 처리
  if (absValue >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  // 1,000 미만은 로컬 표기법 사용 (천 단위 쉼표 등)
  return value.toLocaleString();
};
