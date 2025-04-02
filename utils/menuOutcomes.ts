export const MENU_OUTCOMES = [
  ...Array.from({ length: 18 }, (_, i) => `Menu A${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `Menu B${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `Menu C${i + 1}`),
  ...Array.from({ length: 17 }, (_, i) => `Menu P${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `W.E.L ${i + 1}`),
  "1st Year task",
  "2nd year task",
  "Function task part 1",
  "Function task part 2",
  "Function task part 3",
  "Function task part 4",
  "Function task part 5",
  "1st Year Mid Year Theory Exam",
  "1st Year- Final Theory Exam",
  "2nd Year- Final Exam Theory",
];

export const isMenuOutcome = (outcomeTitle: string): boolean => {
  return MENU_OUTCOMES.includes(outcomeTitle);
};
