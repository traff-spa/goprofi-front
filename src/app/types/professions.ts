// Map of personality types to suitable professions
export interface ProfessionCategory {
    title: string;
    description: string;
    professions: string[];
}

export interface TypeTrait {
    title: string;
    points: string[];
}

export interface TypeDetails {
    typeNumber: number;
    typeName: string;
    typeDescription: string;
    bottomDescription: string | null;
    mainTraits: TypeTrait[];
}

interface TitledPoints {
  title: string;
  points: string[];
}

interface TitledText {
  title: string;
  text: string;
}

interface FearSection {
  title: string;
  text: string;
  note: string;
}

interface StrengthsAndWeaknessesData {
  title: string;
  strengths: TitledPoints;
  weaknesses: TitledPoints;
}

export interface RoadMapData {
  motivation: TitledPoints;
  subconsciousMotive: TitledText;
  importantInWork: TitledPoints;
  mainFear: FearSection;
  strengthsAndWeaknesses: StrengthsAndWeaknessesData;
  recommendations: TitledPoints;
}
