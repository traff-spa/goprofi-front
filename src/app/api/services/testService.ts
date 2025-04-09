import { request } from '../client';

import type {
    Test,
    Question,
    Answer,
    TestResult,
    ApiResponse
} from '@/app/types';

interface TestQuestionsResponse {
    test_id: number;
    test_name: string;
    questions: Question[];
}

export const testService = {
    getAllTests: () =>
        request<ApiResponse<{ tests: Test[] }>>({
            url: '/tests',
            method: 'GET',
        }),

    getTestById: (id: number) =>
        request<ApiResponse<Test>>({
            url: `/tests/${id}`,
            method: 'GET',
        }),

    getTestQuestions: (testId: number) => {
        console.log(`Fetching questions for test ID: ${testId}`);
        return request<TestQuestionsResponse>({
            url: `/tests/${testId}/questions`,
            method: 'GET',
        });
    },

    startTest: (userId: number, testId: number) => {
        console.log(`Starting test for user ${userId}, test ID: ${testId}`);
        return request<ApiResponse<TestResult>>({
            url: '/test-results',
            method: 'POST',
            data: {
                user_id: userId,
                test_id: testId
            },
        });
    },

    saveAnswers: (testResultId: number, answers: Answer[]) =>
        request<ApiResponse<{ message: string; test_result_id: number }>>({
            url: `/test-results/${testResultId}/answers`,
            method: 'POST',
            data: { answers },
        }),

    completeTest: (testResultId: number) =>
        request<ApiResponse<TestResult>>({
            url: `/test-results/${testResultId}/complete`,
            method: 'POST',
        }),

    getTestResult: (id: number) =>
        request<ApiResponse<TestResult>>({
            url: `/test-results/${id}`,
            method: 'GET',
        }),

    getUserTestResults: (userId: number) => {
        console.log(`Fetching test results for user ID (service): ${userId}`);
        return request<ApiResponse<TestResult[]>>({
            url: `/users/${userId}/test-results`,
            method: 'GET',
        });
    },
};