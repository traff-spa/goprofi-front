import { useState, useCallback } from 'react';
import { Question } from '@/app/types';

interface UseTestAnswersProps {
    initialAnswers?: { [key: number]: number | number[] };
    questions: Question[];
}

interface UseTestAnswersReturn {
    answers: { [key: number]: number | number[] };
    selectOption: (questionId: number, optionId: number) => void;
    isQuestionAnswered: (questionId: number) => boolean;
    getQuestionAnswer: (questionId: number) => number | number[] | undefined;
    clearAnswer: (questionId: number) => void;
}

export const useTestAnswers = ({
                                   initialAnswers = {},
                                   questions
                               }: UseTestAnswersProps): UseTestAnswersReturn => {
    const [answers, setAnswers] = useState(initialAnswers);

    const selectOption = useCallback((questionId: number, optionId: number) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        setAnswers(prev => {
            if (question.isMultiple) {
                return handleMultipleChoice(prev, questionId, optionId);
            } else {
                return handleSingleChoice(prev, questionId, optionId);
            }
        });
    }, [questions]);

    const isQuestionAnswered = useCallback((questionId: number) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return false;

        const answer = answers[questionId];

        if (question.isMultiple) {
            return Array.isArray(answer) && answer.length > 0;
        } else {
            return !!answer;
        }
    }, [answers, questions]);

    const getQuestionAnswer = useCallback((questionId: number) => {
        return answers[questionId];
    }, [answers]);

    const clearAnswer = useCallback((questionId: number) => {
        setAnswers(prev => {
            const { [questionId]: removed, ...rest } = prev;
            return rest;
        });
    }, []);

    return {
        answers,
        selectOption,
        isQuestionAnswered,
        getQuestionAnswer,
        clearAnswer,
    };
};

// Helper functions
function handleMultipleChoice(
    prevAnswers: { [key: number]: number | number[] },
    questionId: number,
    optionId: number
) {
    const currentAnswer = prevAnswers[questionId];
    const selected = Array.isArray(currentAnswer) ? currentAnswer : [];
    const isAlreadySelected = selected.includes(optionId);

    return {
        ...prevAnswers,
        [questionId]: isAlreadySelected
            ? selected.filter(id => id !== optionId)
            : [...selected, optionId],
    };
}

function handleSingleChoice(
    prevAnswers: { [key: number]: number | number[] },
    questionId: number,
    optionId: number
) {
    return {
        ...prevAnswers,
        [questionId]: optionId
    };
}