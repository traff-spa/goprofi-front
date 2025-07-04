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
    personality_type_id?: number | null;
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
    pair_id?: number
}

export interface Answer {
    question_id: number;
    selected_option_id: number;
    personality_type_id?: number;
    response_value?: number;
    is_tie_breaker?: boolean;
}