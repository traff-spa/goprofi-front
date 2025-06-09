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
    mainTraits: TypeTrait[];
}