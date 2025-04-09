import type {Answer, Question, Test} from "@app/types/test.ts";

export interface PersonalityType {
    id: number;
    name: string;
    description?: string;
    short_code?: string;
}

export interface TypeScore {
    type_id: number;
    name: string;
    score: number;
    percentage: number;
    questions: number;
}

export interface ResultData {
    type_scores: TypeScore[];
    primary_type?: {
        id: number;
        name: string;
        description?: string;
        characteristics?: string[];
        growth_areas?: string[];
    };
    wing_type?: {
        id: number;
        name: string;
        score: number;
    };
    used_tie_breaker: boolean;
    tied_types?: {
        type_id: number;
        name: string;
        score: number;
    }[];
    requires_tie_breaker?: boolean;
}

export interface TestStore {
    tests: Test[];
    currentTest: Test | null;
    currentTestResult: TestResult | null;
    currentTestQuestions: Question[];
    currentTestName: string;
    userTestResults: TestResult[];
    isLoading: boolean;
    error: string | null;

    // Actions
    resetCurrentTest: () => void;
    fetchAllTests: () => Promise<void>;
    fetchTestById: (id: number) => Promise<void>;
    fetchTestQuestions: (testId: number) => Promise<Question[]>;
    fetchTestResult: (id: number) => Promise<void>;
    fetchUserTestResults: (userId: number) => Promise<void>;
    startTest: (userId: number, testId: number) => Promise<TestResult | null>;
    saveAnswers: (testResultId: number, answers: Answer[]) => Promise<void>;
    completeTest: (testResultId: number) => Promise<void>;
}

export interface TestResult {
    id: number;
    user_id: number;
    test_id: number;
    test_name?: string;
    started_at: Date;
    completed_at: Date | null;
    primary_type_id?: number;
    primary_type?: PersonalityType;
    result_data?: ResultData;
    progress?: number;
    used_tie_breaker?: boolean;
}