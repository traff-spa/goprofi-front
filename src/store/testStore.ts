import {create} from 'zustand';
import {persist} from "zustand/middleware";
import {testService} from '@/app/api/services';

import type {
    TestResult,
    Answer,
    TestStore,
    Question,
    Test
} from '@/app/types';

// Utility for conditional logging - only logs in development
const logDebug = (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(message, data !== undefined ? data : '');
    }
};

// Initial state definition
const initialState = {
    tests: [],
    currentTest: null,
    currentTestResult: null,
    currentTestQuestions: [],
    currentTestName: '',
    userTestResults: [],
    isLoading: false,
    error: null,
    // New tie-breaking properties
    tieBreakingQuestions: [],
    tiedTypes: [],
    isTieBreaking: false,
};

export const useTestStore = create<TestStore>()(
    persist(
        (set) => ({
            ...initialState,

            resetCurrentTest: () => {
                set({
                    currentTest: null,
                    currentTestResult: null,
                    currentTestQuestions: [],
                    currentTestName: '',
                });
            },

            startTest: async (userId: number, testId: number): Promise<TestResult | null> => {
                set({ isLoading: true, error: null });

                try {
                    logDebug(`Starting test for user ${userId}, test ID: ${testId}`);

                    // Start the test first
                    const testResult = await testService.startTest(userId, testId);
                    logDebug('Test Result Response:', testResult);

                    // Fetch the questions
                    const questionsResponse = await testService.getTestQuestions(testId);
                    logDebug('Questions Response:', questionsResponse);

                    // Ensure we have a valid questions response
                    if (!questionsResponse?.questions || !questionsResponse?.test_name) {
                        throw new Error('Invalid questions response');
                    }

                    set({
                        currentTestResult: testResult,
                        currentTestQuestions: questionsResponse.questions,
                        currentTestName: questionsResponse.test_name,
                        isLoading: false
                    });

                    return testResult;
                } catch (error: any) {
                    console.error('Error in startTest:', error);
                    set({
                        error: error.message || 'Failed to start test',
                        isLoading: false
                    });
                    return null;
                }
            },

            fetchAllTests: async (): Promise<Test[]> => {
                set({ isLoading: true, error: null });

                try {
                    const response = await testService.getAllTests();
                    logDebug('All tests response:', response);

                    set({
                        tests: response.tests,
                        isLoading: false
                    });

                    return response.tests;
                } catch (error: any) {
                    console.error('Error fetching all tests:', error);
                    set({
                        error: error.message || 'Failed to fetch tests',
                        isLoading: false
                    });
                    return []; // Return empty array instead of null
                }
            },

            fetchTestById: async (id: number) => {
                set({ isLoading: true, error: null });

                try {
                    const test = await testService.getTestById(id);
                    logDebug('Fetched test by ID:', test);

                    set({
                        currentTest: test,
                        isLoading: false
                    });

                    return test;
                } catch (error: any) {
                    console.error('Error fetching test by ID:', error);
                    set({
                        error: error.message || 'Failed to fetch test',
                        isLoading: false
                    });
                    return null;
                }
            },

            fetchTestQuestions: async (testId: number): Promise<Question[]> => {
                set({ isLoading: true, error: null });

                try {
                    const questionsResponse = await testService.getTestQuestions(testId);
                    logDebug('Fetched questions response:', questionsResponse);

                    set({
                        currentTestQuestions: questionsResponse.questions,
                        currentTestName: questionsResponse.test_name,
                        isLoading: false
                    });

                    return questionsResponse.questions;
                } catch (error: any) {
                    console.error('Error fetching test questions:', error);
                    set({
                        error: error.message || 'Failed to fetch test questions',
                        isLoading: false
                    });
                    return []; // Return empty array instead of null
                }
            },

            fetchTestResult: async (id: number): Promise<TestResult | null> => {
                set({ isLoading: true, error: null });

                try {
                    logDebug(`Fetching test result for ID: ${id}`);
                    const testResult = await testService.getTestResult(id);
                    logDebug('Fetched test result:', testResult);

                    set({
                        currentTestResult: testResult,
                        isLoading: false
                    });

                    return testResult;
                } catch (error: any) {
                    console.error('Error fetching test result:', error);
                    set({
                        error: error.message || 'Failed to fetch test result',
                        isLoading: false
                    });
                    return null;
                }
            },

            fetchUserTestResults: async (userId: number): Promise<TestResult[]> => {
                set({ isLoading: true, error: null });

                try {
                    const results = await testService.getUserTestResults(userId);

                    set({
                        userTestResults: results,
                        isLoading: false
                    });

                    return results;
                } catch (error: any) {
                    console.error('Error fetching user test results:', error);
                    set({
                        error: error.message || 'Failed to fetch test history',
                        isLoading: false,
                        userTestResults: []
                    });
                    return [];
                }
            },

            saveAnswers: async (testResultId: number, answers: Answer[]) => {
                set({ isLoading: true, error: null });

                try {
                    // Ensure answers have all required properties for the backend
                    const formattedAnswers = answers.map(answer => ({
                        question_id: answer.question_id,
                        selected_option_id: answer.selected_option_id,
                        response_value: answer.selected_option_id, // Use the selected option ID as the response value
                        is_tie_breaker: false
                    }));

                    logDebug(`Saving ${formattedAnswers.length} answers for test result ${testResultId}`);

                    const response = await testService.saveAnswers(testResultId, formattedAnswers);
                    set({ isLoading: false });
                    return response;
                } catch (error: any) {
                    console.error('Error saving answers:', error);
                    set({
                        error: error.message || 'Failed to save answers',
                        isLoading: false
                    });
                    return null;
                }
            },

            completeTest: async (testResultId: number): Promise<TestResult | null> => {
                set({ isLoading: true, error: null });

                try {
                    logDebug(`Completing test with ID: ${testResultId}`);
                    const result = await testService.completeTest(testResultId);
                    logDebug('Complete test response:', result);

                    set({
                        currentTestResult: result,
                        isLoading: false
                    });

                    return result;
                } catch (error: any) {
                    console.error('Error completing test:', error);
                    set({
                        error: error.message || 'Failed to complete test',
                        isLoading: false
                    });
                    return null; // Return null instead of re-throwing
                }
            },

            // New tie-breaking functionality
            fetchTieBreakers: async (testResultId: number): Promise<Question[]> => {
                set({ isLoading: true, error: null });

                try {
                    const response = await testService.getTieBreakers(testResultId);

                    // Transform the tied_type_ids into the expected format
                    const tiedTypeObjects = response.tied_type_ids.map(id => ({
                        type_id: id,
                        name: "", // You'll need to populate this from your data
                        score: 0  // Default score
                    }));

                    set({
                        tieBreakingQuestions: response.questions,
                        tiedTypes: tiedTypeObjects,
                        isTieBreaking: true,
                        isLoading: false
                    });

                    return response.questions;
                } catch (error: any) {
                    console.error('Failed to fetch tie-breaking questions:', error);
                    set({
                        error: error.message || 'Failed to fetch tie-breaking questions',
                        isLoading: false
                    });
                    return [];
                }
            },

            saveTieBreakerAnswers: async (testResultId: number, answers: Answer[]): Promise<TestResult | null> => {
                set({ isLoading: true, error: null });

                try {
                    // Mark these answers as tie breakers
                    const tieBreakerAnswers = answers.map(answer => ({
                        ...answer,
                        is_tie_breaker: true
                    }));

                    const result = await testService.saveTieBreakerAnswers(testResultId, tieBreakerAnswers);

                    set({
                        currentTestResult: result,
                        isTieBreaking: false,
                        isLoading: false
                    });

                    return result;
                } catch (error: any) {
                    console.error('Failed to save tie-breaker answers:', error);
                    set({
                        error: error.message || 'Failed to save tie-breaker answers',
                        isLoading: false
                    });
                    return null;
                }
            }
        }),
        {
            name: 'test-store',
            partialize: (state) => ({
                tests: state.tests,
                currentTest: state.currentTest,
                currentTestResult: state.currentTestResult,
                userTestResults: state.userTestResults,
            }),
        }
    )
);

// Optional selector hooks for better component performance
export const useTests = () => useTestStore(state => state.tests);
export const useCurrentTest = () => useTestStore(state => state.currentTest);
export const useCurrentTestResult = () => useTestStore(state => state.currentTestResult);
export const useCurrentTestQuestions = () => useTestStore(state => state.currentTestQuestions);
export const useTestLoading = () => useTestStore(state => state.isLoading);
export const useTestError = () => useTestStore(state => state.error);