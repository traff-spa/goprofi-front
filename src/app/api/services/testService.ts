import { request } from '../client';

import type {
    Test,
    Answer,
    TestResult,
    TestsResponse,
    TestQuestionsResponse,
    SaveAnswersResponse,
    TieBreakersResponse,
    Question
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

    // New method to get a single question by ID
    getQuestionById: (id: number) =>
        request<Question>({
            url: `/questions/${id}`,
            method: 'GET',
        }),

    // Original method - keep for compatibility
    getTestQuestions: (testId: number) => {
        return request<TestQuestionsResponse>({
            url: `/tests/${testId}/questions`,
            method: 'GET',
        });
    },

    startTest: (userId: number, testId: number) => {
        console.log(`Starting test for user ${userId}, test ID: ${testId}`);
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

        console.log(`Saving ${answers.length} answers to the server for test ${testResultId}`);

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
        console.log(`Fetching test result for ID: ${id}`);
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
    },

    // Efficient batched saving of multiple answers
    saveMultipleAnswers: async (testResultId: number, answers: Answer[]) => {
        if (!answers || answers.length === 0) {
            return { message: 'No answers to save', test_result_id: testResultId };
        }

        // Batch answers in groups of 10 for better performance
        const batches = [];
        for (let i = 0; i < answers.length; i += 10) {
            batches.push(answers.slice(i, i + 10));
        }

        // Process batches sequentially
        for (const batch of batches) {
            try {
                await request<SaveAnswersResponse>({
                    url: `/test-results/${testResultId}/answers`,
                    method: 'POST',
                    data: { answers: batch },
                });
            } catch (error) {
                console.error('Error saving answer batch:', error);
                throw error;
            }
        }

        return { message: 'All answers saved successfully', test_result_id: testResultId };
    }
};