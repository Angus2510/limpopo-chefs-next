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
  "Mid Year Assessment - 1st Year",
  "1st Year Mid Year Theory Exam",
  "1st Year- Final Theory Exam",
  "2nd Year- Final Exam Theory",
  "Mid Year Exam - Theory",
  "Mid Year Exam - Practical",
  "Menu A18- Final Summative Practical Exam",
  "C&G Evolve (7107-22): Food Safety 1st Year",
  "C&G Evolve (8064-01): Food Prep 2nd Year",
  "C&G Evolve (8064-01): Food Safety 2nd Year",
  "C&G Evolve (8064-01): Hospitality Principles 2nd Year",
  "C&G Evolve (8064-06): Culinary arts and supervision 3rd Year",
  "C&G Evolve (8064-06): Monitoring and supervision of food safety 3rd Year",
];

export const isMenuOutcome = (outcomeTitle: string): boolean => {
  return MENU_OUTCOMES.includes(outcomeTitle);
};
