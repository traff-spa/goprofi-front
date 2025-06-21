import { request } from '../client';

import type {
    Test,
    Answer,
    TestResult,
    TestsResponse,
    TestQuestionsResponse,
    SaveAnswersResponse,
    TieBreakersResponse
} from '@/app/types';

export const testService = {
    getAllTests: () =>
        request<TestsResponse>({
            url: '/tests',
            method: 'GET',
        }),

    getTestById: (id: number) =>
        request<Test>({
            url: `/tests/${id}`,
            method: 'GET',
        }),

    getTestQuestions: (testId: number) => {
        return request<TestQuestionsResponse>({
            url: `/tests/${testId}/questions`,
            method: 'GET',
        });
    },

    startTest: (userId: number, testId: number) => {
        return request<TestResult>({
            url: '/test-results',
            method: 'POST',
            data: {
                user_id: userId,
                test_id: testId
            },
        });
    },

    saveAnswers: async (testResultId: number, answers: Answer[]) => {
        if (!answers || answers.length === 0) {
            console.warn('No answers to save');
            return { message: 'No answers to save', test_result_id: testResultId };
        }

        try {
            return await request<SaveAnswersResponse>({
                url: `/test-results/${testResultId}/answers`,
                method: 'POST',
                data: { answers },
            });
        } catch (error) {
            console.error('Error in saveAnswers API call:', error);
            throw error; // Re-throw to allow handling in the component
        }
    },

    completeTest: (testResultId: number) =>
        request<TestResult>({
            url: `/test-results/${testResultId}/complete`,
            method: 'POST',
        }),

    getTestResult: (id: number) => {
        return request<TestResult>({
            url: `/test-results/${id}`,
            method: 'GET',
        });
    },

    getUserTestResults: (userId: number) => {
        return request<TestResult[]>({
            url: `/users/${userId}/test-results`,
            method: 'GET',
        });
    },

    // Tie-breaking functionality
    getTieBreakers: (testResultId: number) => {
        return request<TieBreakersResponse>({
            url: `/test-results/${testResultId}/tie-breaker`,
            method: 'GET',
        });
    },

    saveTieBreakerAnswers: (testResultId: number, answers: Answer[]) => {
        return request<TestResult>({
            url: `/test-results/${testResultId}/tie-breaker`,
            method: 'POST',
            data: { answers },
        });
    }
};