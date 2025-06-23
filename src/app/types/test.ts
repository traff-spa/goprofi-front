export interface Test {
    id: number;
    name: string;
    description: string | null;
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuestionOption {
    id: number;
    question_id: number;
    text: string;
    value: number;
    option_order: number | null;
    isMultiple?: boolean // TODO: Признак того что можно выбрать несколько вариантов ответов
}

export interface Question {
    id: number;
    test_id: number;
    category_id: number | null;
    personality_type_id: number;
    text: string;
    question_order: number | null;
    is_active: boolean;
    options: QuestionOption[];
    isMultiple?: boolean // TODO: Признак того что можно выбрать несколько вариантов ответов
}

// Updated Answer type to match backend
export interface Answer {
    question_id: number;
    selected_option_id: number;
    response_value?: number;
    is_tie_breaker?: boolean;
}

export interface UseTestNavigationProps {
    testResultId: number;
    totalQuestions: number;
}

export interface UseTestNavigationReturn {
    currentStep: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    progressPercentage: number;
    goNext: () => void;
    goBack: () => void;
}

export interface UseTestDataReturn {
    questions: Question[];
    isLoading: boolean;
    error: string | null;
    // setQuestions: (changedState :Question[] ) => void;
}

export interface UseTestActionsProps {
    testResultId: number;
    onComplete: () => void;
}

export interface UseTestActionsReturn {
    isSubmitting: boolean;
    submitAnswer: (question: Question, answer: number | number[]) => Promise<void>;
    finishTest: () => Promise<void | Question[]>;
}