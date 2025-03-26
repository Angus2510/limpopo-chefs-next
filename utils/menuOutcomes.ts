export const MENU_OUTCOMES = [
  ...Array.from({ length: 18 }, (_, i) => `Menu A${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `Menu B${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `Menu C${i + 1}`),
];

export const isMenuOutcome = (outcomeTitle: string): boolean => {
  return MENU_OUTCOMES.includes(outcomeTitle);
};
