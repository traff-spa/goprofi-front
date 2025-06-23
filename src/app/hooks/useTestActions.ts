import {useState, useCallback} from 'react';
import {saveAnswer, completeTest} from '@app/helpers/testHelpers';
// import {testService} from '@app/api/services'

import {Question, UseTestActionsProps, UseTestActionsReturn} from '@/app/types';
import {useTestStore} from "@/store/testStore.ts";

export const useTestActions = ({testResultId, onComplete}: UseTestActionsProps): UseTestActionsReturn => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAnswer = useCallback(async (question: Question, answer: number | number[]) => {
        try {
            setIsSubmitting(true);
            const response = await saveAnswer(testResultId, question.id, answer as number);
            return response;
        } catch (error) {
            console.error('Error saving answer:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [testResultId]);

    const finishTest = useCallback(async () => {
        try {
            setIsSubmitting(true);
            const response = await completeTest(testResultId);
            if (response.requires_tie_breaker) {
                const {fetchTieBreakers} = useTestStore();
                const tieBreakingQuestions = await fetchTieBreakers(testResultId)
                console.log('tieBreakingQuestions FROM getTieBreakers service', tieBreakingQuestions);
                return tieBreakingQuestions;
            }
            onComplete();
        } catch (error) {
            console.error('Error completing test:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [testResultId]);

    return {
        isSubmitting,
        submitAnswer,
        finishTest,
    };
};