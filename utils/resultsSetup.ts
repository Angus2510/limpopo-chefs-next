export type IntakeType = keyof typeof GROUP_SUBJECTS;
export type IntakeCategory =
  | "OCG"
  | "PASTRY"
  | "AWARDS"
  | "DIPLOMA"
  | "CERTIFICATE";

export interface Result {
  id: string;
  dateTaken: Date;
  assignments?: {
    title: string;
    type: string;
  };
  outcome?: {
    title: string;
  };
  scores: number;
  percent: number;
  taskScore: number | null;
  testScore: number | null;
  status: string;
}

export function getIntakeCategory(intakeString?: string): IntakeCategory {
  if (!intakeString) {
    return "OCG";
  }

  const upperIntake = intakeString.toUpperCase();

  // Check for special cases first
  if (upperIntake.includes("DIPLOMA PASTRY")) return "PASTRY";
  if (upperIntake.includes("DIPLOMA EXCHANGE")) return "DIPLOMA";
  if (upperIntake.includes("DIPLOMA")) return "DIPLOMA";

  // Check for online variants
  if (upperIntake.includes("ONLINE AWARD")) return "AWARDS";
  if (upperIntake.includes("ONLINE CERTIFICATE")) return "CERTIFICATE";

  // Check for standard categories
  if (upperIntake.includes("OCG") || upperIntake.includes("CATHSSETA"))
    return "OCG";
  if (upperIntake.includes("PASTRY")) return "PASTRY";
  if (upperIntake.includes("AWARD")) return "AWARDS";
  if (upperIntake.includes("CERTIFICATE")) return "CERTIFICATE";

  // Handle COOK category - map it to OCG since they follow the same curriculum
  if (upperIntake.includes("COOK") || upperIntake.includes("BLOCK RELEASE")) {
    return "OCG";
  }

  // Handle part-time variants
  if (upperIntake.includes("PART - TIME")) {
    if (upperIntake.includes("PASTRY")) return "PASTRY";
    if (upperIntake.includes("COOK")) return "OCG";
  }

  return "OCG";
}

interface Subject {
  title: string;
  type: "Theory" | "Practical" | "Exams/Well";
}

const GROUP_SUBJECTS = {
  OCG: {
    subjects: [
      // First Year Theory
      { title: "01:01 - Introduction to Food Costing 1.0", type: "Theory" },
      { title: "01:02 - Introduction to French 1.0", type: "Theory" },
      {
        title: "01:03 - Introduction to the Hospitality Industry",
        type: "Theory",
      },
      {
        title: "01:04 - Introduction to Nutrition and Healthy Eating",
        type: "Theory",
      },
      { title: "01:05 - Essential Knife Skills", type: "Theory" },
      { title: "01:06 - Food Safety and Quality Assurance", type: "Theory" },
      { title: "01:07 - Health and Safety in the Workplace", type: "Theory" },
      { title: "01:08 - Personal Hygiene in the Workplace", type: "Theory" },
      {
        title: "01:09 - Food Preparation Methods, Techniques and Equipment",
        type: "Theory",
      },
      { title: "01:10 - Food Cooking Methods & Techniques", type: "Theory" },
      {
        title: "01:11 part 1 - Food Commodities & Basic Ingredients",
        type: "Theory",
      },
      {
        title: "01:11 part 2 - Food Commodities & Basic Ingredients",
        type: "Theory",
      },
      {
        title: "01:12 - Theory of Food Production & Customer Service",
        type: "Theory",
      },
      { title: "01:13 - Numeracy and Units of Measurement", type: "Theory" },
      {
        title: "01:14 - Introduction: Meal Planning and Menus",
        type: "Theory",
      },
      { title: "01:15 - Computer Literacy and Research", type: "Theory" },
      { title: "01:16 - Environmental Awareness", type: "Theory" },
      { title: "01:17 - Personal Development as a Chef", type: "Theory" },

      // Second Year Theory
      { title: "02:01 - Environmental Sustainability", type: "Theory" },
      { title: "02:02 - Advanced Menu Planning and Costing", type: "Theory" },
      {
        title:
          "02:03 part 1 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 2 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 3 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 4 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 5 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title: "02:05 - Staff Resource Management and Self Development",
        type: "Theory",
      },
      {
        title: "02:06 - Theory of Commodity Resource Management",
        type: "Theory",
      },
      { title: "02:07 - Understand Business Success", type: "Theory" },
      { title: "02:08 - Provide Guest Service", type: "Theory" },

      // Third Year Theory
      { title: "03:01 - Theory of Safety Supervision", type: "Theory" },
      {
        title: "03:02 - Theory of Food Production Supervision",
        type: "Theory",
      },
      { title: "03:03 - Contribute to Business Success", type: "Theory" },
      { title: "03:04 - Contribute to the Guest Experience", type: "Theory" },
      {
        title:
          "03:05 - Developing Opportunities for Progression in the Culinary Industry",
        type: "Theory",
      },
      {
        title: "03:06 part 1 - Gastronomy and Global Cuisines",
        type: "Theory",
      },
      {
        title: "03:06 part 2 - Gastronomy and Global Cuisines",
        type: "Theory",
      },
      {
        title: "03:06 part 3 - Gastronomy and Global Cuisines",
        type: "Theory",
      },
      { title: "03:07 - Operational Cost Control", type: "Theory" },

      // Function Tasks
      { title: "Function Task Part 1", type: "Theory" },
      { title: "Function Task Part 2", type: "Theory" },
      { title: "Function Task Part 3", type: "Theory" },
      { title: "Function Task Part 4", type: "Theory" },
      { title: "Function Task Part 5", type: "Theory" },
      { title: "Function Task Part 6", type: "Theory" },
      { title: "Function Task Part 7", type: "Theory" },
      { title: "Function Task Part 8", type: "Theory" },
      { title: "Function Task Part 9", type: "Theory" },
      { title: "Function Task Part 10", type: "Theory" },

      // A Series Practical Menus
      { title: "Menu A1", type: "Practical" }, // Knife skills
      { title: "Menu A2", type: "Practical" }, // Eggs
      { title: "Menu A3", type: "Practical" }, // Stocks
      { title: "Menu A4", type: "Practical" }, // Sauces
      { title: "Menu A5", type: "Practical" }, // Bread
      { title: "Menu A6", type: "Practical" }, // Salad
      { title: "Menu A7", type: "Practical" }, // Dessert 1
      { title: "Menu A8", type: "Practical" }, // Dessert 2
      { title: "Menu A9", type: "Practical" }, // Quiche
      { title: "Menu A10", type: "Practical" }, // Choux Pastry
      { title: "Menu A11", type: "Practical" }, // Hot Soup
      { title: "Menu A12", type: "Practical" }, // Cold Soup
      { title: "Menu A13", type: "Practical" }, // Pannacotta
      { title: "Menu A14", type: "Practical" }, // Fruit Tart
      { title: "Menu A15", type: "Practical" }, // Chicken Korma
      { title: "Menu A16", type: "Practical" }, // Fish & Chips
      { title: "Menu A17", type: "Practical" }, // Chicken Cordon Bleu
      { title: "Menu A18", type: "Practical" }, // Breakfast

      // B Series Practical Menus
      { title: "Menu B1", type: "Practical" }, // Flat fish & Prawn
      { title: "Menu B2", type: "Practical" }, // Steak & Kidney Pie
      { title: "Menu B3", type: "Practical" }, // Cold Cucumber Soup
      { title: "Menu B4", type: "Practical" }, // Sweet & Sour Pork
      { title: "Menu B5", type: "Practical" }, // Sourdough Panini
      { title: "Menu B6", type: "Practical" }, // Egg Yolk Ravioli
      { title: "Menu B7", type: "Practical" }, // Various Items
      { title: "Menu B8", type: "Practical" }, // Vanilla Mini Gateaux
      { title: "Menu B9", type: "Practical" }, // 3-Course Menu

      // C Series Practical Menus
      { title: "Menu C1", type: "Practical" }, // Mexican & Moroccan
      { title: "Menu C2", type: "Practical" }, // Octopus Carpaccio
      { title: "Menu C3", type: "Practical" }, // Pate Grand-mere
      { title: "Menu C4", type: "Practical" }, // Beef Wellington
      { title: "Menu C5", type: "Practical" }, // Linefish
      { title: "Menu C6", type: "Practical" }, // Outdoor Cooking

      // Assessments and Exams
      { title: "1st Year Task", type: "Exams/Well" },
      { title: "Mid Year Theory Exam", type: "Exams/Well" },
      { title: "Final Theory Exam", type: "Exams/Well" },
      { title: "Wine and Food Pairing", type: "Theory" },
      { title: "Trade Test- Theory Exam", type: "Exams/Well" },
      { title: "Trade Test- Practical Exam", type: "Exams/Well" },
      {
        title: "Monitoring and supervision of food safety",
        type: "Exams/Well",
      },
      { title: "Culinary arts and supervision", type: "Exams/Well" },
    ],
  },

  PASTRY: {
    subjects: [
      // Theory subjects
      { title: "P02:01 - Understand the Hospitality Industry", type: "Theory" },
      { title: "P02:02 - Understand Business Success", type: "Theory" },
      { title: "P02:03 - Provide Guest Service", type: "Theory" },
      {
        title:
          "P02:04 - Awareness of Sustainability in the Hospitality Industry",
        type: "Theory",
      },
      {
        title: "P02:05 - Understand Own Role in Self Development",
        type: "Theory",
      },
      { title: "P02:06 - Food Safety", type: "Theory" },
      {
        title: "P02:07 - Meet Guest Requirements through Menu Planning",
        type: "Theory",
      },
      {
        title:
          "P02:08 - Prepare, Cook and Finish Cakes, Biscuits and Sponge Products using Standardised Recipes",
        type: "Theory",
      },
      {
        title:
          "P02:09 - Prepare, Cook and Finish Pastry Products using Standardised Recipes",
        type: "Theory",
      },
      {
        title:
          "P02:10 - Produce, Cook and Finish Dough Products using Standardised Recipes",
        type: "Theory",
      },
      {
        title:
          "P02:11 - Prepare, Cook and Finish Hot Desserts using Standardised Recipes",
        type: "Theory",
      },
      {
        title:
          "P02:12 - Prepare, Cook and Finish Cold Desserts using Standardised Recipes",
        type: "Theory",
      },
      {
        title:
          "P02:13 - Prepare and Finish Simple Chocolate Products using Standardised Recipes",
        type: "Theory",
      },
      { title: "P02:14 - Mise en Place", type: "Theory" },

      // Practical Menus
      { title: "Menu P1", type: "Practical" }, // Bread: White Loaf
      { title: "Menu P2", type: "Practical" }, // Hot Dessert: Bread and Butter pudding
      { title: "Menu P3", type: "Practical" }, // Biscuits
      { title: "Menu P4", type: "Practical" }, // Cold dessert
      { title: "Menu P5", type: "Practical" }, // Choux Pastry
      { title: "Menu P6", type: "Practical" }, // Chocolate
      { title: "Menu P7", type: "Practical" }, // Sponge product
      { title: "Menu P8", type: "Practical" }, // Puff pastry
      { title: "Menu P9", type: "Practical" }, // Celebration cake
      { title: "Menu P10", type: "Practical" }, // Shortcrust
      { title: "Menu P11", type: "Practical" }, // Unleavened & Phyllo
      { title: "Menu P12", type: "Practical" }, // Brioche
      { title: "Menu P13", type: "Practical" }, // Chocolate Macarons
      { title: "Menu P14", type: "Practical" }, // Pannacotta
      { title: "Menu P15", type: "Practical" }, // Fondant work
      { title: "Menu P16", type: "Practical" }, // Themed Decorated sugar cookies
      { title: "Menu P17", type: "Practical" }, // Sweet High Tea

      // Skills Assessments
      { title: "Skills P01", type: "Practical" },
      { title: "Skills P02", type: "Practical" },
      { title: "Skills P03", type: "Practical" },

      // Exams and Assessments
      { title: "Final Inhouse Pastry Theory Exam", type: "Exams/Well" },
      { title: "Mid Year Exam - Theory", type: "Exams/Well" },
      {
        title: "City & Guilds- Evolve Exam (8064-01)- Food Safety",
        type: "Exams/Well",
      },
    ],
  },

  AWARDS: {
    subjects: [
      // Theory subjects
      { title: "01:01 - Introduction to Food Costing 1.0", type: "Theory" },
      { title: "01:02 - Introduction to French 1.0", type: "Theory" },
      {
        title: "01:03 - Introduction to the Hospitality Industry",
        type: "Theory",
      },
      {
        title: "01:04 - Introduction to Nutrition and Healthy Eating",
        type: "Theory",
      },
      { title: "01:05 - Essential Knife Skills", type: "Theory" },
      { title: "01:06 - Food Safety and Quality Assurance", type: "Theory" },
      { title: "01:07 - Health and Safety in the Workplace", type: "Theory" },
      { title: "01:08 - Personal Hygiene in the Workplace", type: "Theory" },
      {
        title: "01:09 - Food Preparation Methods, Techniques and Equipment",
        type: "Theory",
      },
      { title: "01:10 - Food Cooking Methods & Techniques", type: "Theory" },

      // Assessments
      { title: "1st Year Task", type: "Exams/Well" },
      { title: "Mid Year Theory Exam", type: "Exams/Well" },
      { title: "Evolve Safety", type: "Exams/Well" },

      // Practical Menus
      { title: "Menu A1", type: "Practical" }, // Knife skills
      { title: "Menu A2", type: "Practical" }, // Eggs
      { title: "Menu A3", type: "Practical" }, // Stocks
      { title: "Menu A4", type: "Practical" }, // Sauces
      { title: "Menu A5", type: "Practical" }, // Bread
      { title: "Menu A6", type: "Practical" }, // Salads
      { title: "Menu A7", type: "Practical" }, // Desserts 1
      { title: "Menu A8", type: "Practical" }, // Desserts 2
      { title: "Menu A18", type: "Practical" }, // Breakfast

      // Additional Award-specific assessments
      { title: "Final Assessment - Award", type: "Theory" },
      {
        title: "City & Guilds- Evolve Exam (8064-01)- Food Safety",
        type: "Exams/Well",
      },
      { title: "Unit 202- Safety at Work Test", type: "Exams/Well" },
    ],
  },

  DIPLOMA: {
    subjects: [
      // Theory subjects
      {
        title: "01:03 - Introduction to the Hospitality Industry",
        type: "Theory",
      },
      { title: "01:06 - Food Safety and Quality Assurance", type: "Theory" },
      { title: "01:08 - Personal Hygiene in the Workplace", type: "Theory" },
      { title: "01:10 - Food Cooking Methods & Techniques", type: "Theory" },
      { title: "02:01 - Environmental Sustainability", type: "Theory" },
      { title: "02:02 - Advanced Menu Planning and Costing", type: "Theory" },
      {
        title:
          "02:03 part 1 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 2 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 3 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 4 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title:
          "02:03 part 5 - Theory of Preparing, Cooking and Finishing Dishes",
        type: "Theory",
      },
      {
        title: "02:05 - Staff Resource Management and Self Development",
        type: "Theory",
      },
      { title: "02:07 - Understand Business Success", type: "Theory" },
      { title: "02:08 - Provide Guest Service", type: "Theory" },

      // Practical Menus
      { title: "Menu B1", type: "Practical" }, // Flat fish & Prawn tail
      { title: "Menu B2", type: "Practical" }, // Guiness ale Steak n Kidney Pie
      { title: "Menu B3", type: "Practical" }, // Cold cucumber soup
      { title: "Menu B4", type: "Practical" }, // Sweet n Sour Pork
      { title: "Menu B5", type: "Practical" }, // Sour dough Panini
      { title: "Menu B6", type: "Practical" }, // Egg Yolk Ravioli
      { title: "Menu B7", type: "Practical" }, // Multiple items including Curry Venison
      { title: "Menu B8", type: "Practical" }, // Vanilla mini gateaux
      { title: "Menu B9", type: "Practical" }, // 3-course meal with bread

      // Assessments and Exams
      { title: "Diploma Task", type: "Exams/Well" },
      { title: "Final Theory Exam", type: "Exams/Well" },
      { title: "Food Safety Evolve", type: "Exams/Well" },
      { title: "Food preparation & Culinary Arts", type: "Exams/Well" },
      { title: "Hospitality Principles", type: "Exams/Well" },
    ],
  },

  CERTIFICATE: {
    subjects: [
      // Theory subjects
      { title: "01:01 - Introduction to Food Costing 1.0", type: "Theory" },
      { title: "01:02 - Introduction to French 1.0", type: "Theory" },
      {
        title: "01:03 - Introduction to the Hospitality Industry",
        type: "Theory",
      },
      {
        title: "01:04 - Introduction to Nutrition and Healthy Eating",
        type: "Theory",
      },
      { title: "01:05 - Essential Knife Skills", type: "Theory" },
      { title: "01:06 - Food Safety and Quality Assurance", type: "Theory" },
      { title: "01:07 - Health and Safety in the Workplace", type: "Theory" },
      { title: "01:08 - Personal Hygiene in the Workplace", type: "Theory" },
      {
        title: "01:09 - Food Preparation Methods, Techniques and Equipment",
        type: "Theory",
      },
      { title: "01:10 - Food Cooking Methods & Techniques", type: "Theory" },
      {
        title: "01:11 part 1 - Food Commodities & Basic Ingredients",
        type: "Theory",
      },
      {
        title: "01:11 part 2 - Food Commodities & Basic Ingredients",
        type: "Theory",
      },
      {
        title: "01:12 - Theory of Food Production & Customer Service",
        type: "Theory",
      },
      { title: "01:13 - Numeracy and Units of Measurement", type: "Theory" },
      {
        title: "01:14 - Introduction: Meal Planning and Menus",
        type: "Theory",
      },
      { title: "01:15 - Computer Literacy and Research", type: "Theory" },
      { title: "01:16 - Environmental Awareness", type: "Theory" },
      { title: "01:17 - Personal Development as a Chef", type: "Theory" },
      {
        title: "02:06 - Theory of Commodity Resource Management",
        type: "Theory",
      },

      // Practical Menus
      { title: "Menu A1", type: "Practical" }, // Knife skills
      { title: "Menu A2", type: "Practical" }, // Eggs
      { title: "Menu A3", type: "Practical" }, // Stocks
      { title: "Menu A4", type: "Practical" }, // Sauces
      { title: "Menu A5", type: "Practical" }, // Bread
      { title: "Menu A6", type: "Practical" }, // Salad
      { title: "Menu A7", type: "Practical" }, // Dessert 1
      { title: "Menu A8", type: "Practical" }, // Dessert 2
      { title: "Menu A9", type: "Practical" }, // Quiche
      { title: "Menu A10", type: "Practical" }, // Choux Pastry
      { title: "Menu A11", type: "Practical" }, // Hot Soup
      { title: "Menu A12", type: "Practical" }, // Cold Soup
      { title: "Menu A13", type: "Practical" }, // Pannacotta
      { title: "Menu A14", type: "Practical" }, // Fruit Tart
      { title: "Menu A15", type: "Practical" }, // Chicken Korma
      { title: "Menu A16", type: "Practical" }, // Fish & Chips
      { title: "Menu A17", type: "Practical" }, // Chicken Cordon Bleu
      { title: "Menu A18", type: "Practical" }, // Breakfast

      // Assessments and Exams
      { title: "1st Year Task", type: "Exams/Well" },
      { title: "Final Theory Exam", type: "Exams/Well" },
      { title: "Mid Year Theory Exam", type: "Exams/Well" },
      { title: "Evolve Safety", type: "Exams/Well" },
    ],
  },
};

export function filterAndSortResults(results: Result[], intakeString?: string) {
  if (!results || !Array.isArray(results)) {
    console.log("No results array provided");
    return [];
  }

  const intakeCategory = getIntakeCategory(intakeString);
  const subjects = GROUP_SUBJECTS[intakeCategory]?.subjects;

  if (!subjects) {
    console.log("No subjects found for category:", intakeCategory);
    return results;
  }

  console.log("Filtering results for category:", intakeCategory);

  const filteredResults = results.filter((result) => {
    const resultTitle = result.assignments?.title || result.outcome?.title;
    if (!resultTitle) return false;

    const matchingSubject = subjects.find(
      (subject) => subject.title === resultTitle
    );
    if (matchingSubject) {
      console.log("Matched subject:", resultTitle);
      return true;
    }
    return false;
  });

  console.log(
    `Filtered ${results.length} results down to ${filteredResults.length}`
  );

  return filteredResults.sort((a, b) => {
    const dateA = new Date(a.dateTaken).getTime();
    const dateB = new Date(b.dateTaken).getTime();

    if (dateA !== dateB) return dateB - dateA;
    return (b.percent || b.scores || 0) - (a.percent || a.scores || 0);
  });
}

export const GROUP_SUBJECTS_CONFIG = GROUP_SUBJECTS;
