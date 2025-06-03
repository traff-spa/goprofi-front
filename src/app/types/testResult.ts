import type {Answer, Question, Test} from "@app/types/test.ts";

export interface PersonalityType {
    id: number;
    name: string;
    description?: string;
    short_code?: string;
}

// Define response shapes based on actual backend responses
export interface TestsResponse {
    tests: Test[];
}

export interface TestQuestionsResponse {
    test_id: number;
    test_name: string;
    questions: Question[];
}

export interface SaveAnswersResponse {
    message: string;
    test_result_id: number;
}

export interface TieBreakersResponse {
    test_result_id: string;
    tied_type_ids: number[];
    questions: Question[];
}

export interface TypeScore {
    type_id: number;
    name: string;
    score: number;
    percentage: number;
    questions: number;
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
    // Tie-breaking properties
    tieBreakingQuestions: Question[];
    tiedTypes: { type_id: number; name: string; score: number; }[];
    isTieBreaking: boolean;

    // testPage props
    isTestPage: boolean;
    testTitle: string | null;

    // testResult props
    isTestResultPage: boolean;

    // Actions
    setIsTestResultPage: (isTestResultPage: boolean) => void;
    setIsTestPage: (isTestPage: boolean) => void;
    setTestTitle: (title: string | null) => void;
    resetCurrentTest: () => void;
    fetchAllTests: () => Promise<Test[]>;
    fetchTestById: (id: number) => Promise<Test | null>;
    fetchTestQuestions: (testId: number) => Promise<Question[]>;
    fetchTestResult: (id: number) => Promise<TestResult | null>;
    fetchUserTestResults: (userId: number) => Promise<TestResult[]>;
    startTest: (userId: number, testId: number) => Promise<TestResult | null>;
    saveAnswers: (testResultId: number, answers: Answer[]) => Promise<any>;
    completeTest: (testResultId: number) => Promise<TestResult | null>;
    // New tiebreaking functions
    fetchTieBreakers: (testResultId: number) => Promise<Question[]>;
    saveTieBreakerAnswers: (testResultId: number, answers: Answer[]) => Promise<TestResult | null>;
    lastSavedAnswerTimestamp: number;
    // Test position tracking
    testPositions: { [testResultId: number]: number };
    saveTestPosition: (testResultId: number, position: number) => void;
    getTestPosition: (testResultId: number) => number;
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

export interface Props {
    testResultId: number;
    setCompleted: (state: boolean) => void;
    initialAnswers?: {[key: number]: number};
}