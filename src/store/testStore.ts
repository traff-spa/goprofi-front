import {create} from 'zustand';
import {persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import {testService} from '@/app/api/services';

import type {
    TestResult,
    Answer,
    TestStore,
    Question
} from '@/app/types';

const QUIZ_STORE = 'quiz_store'

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
};

export const useTestStore = create<TestStore>()(
    persist(
        immer((set) => ({
            ...initialState,

            resetCurrentTest: () => {
                set(state => {
                    state.currentTest = null;
                    state.currentTestResult = null;
                    state.currentTestQuestions = [];
                    state.currentTestName = '';
                });
            },

            startTest: async (userId: number, testId: number): Promise<TestResult | null> => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    console.log(`Starting test for user ${userId}, test ID: ${testId}`);

                    // Start the test first
                    const testResultResponse = await testService.startTest(userId, testId);
                    console.log('Test Result Response:', testResultResponse);

                    // Ensure we have a valid test result response
                    if (!testResultResponse || !testResultResponse.data) {
                        throw new Error('Invalid test result response');
                    }

                    // Fetch the questions
                    const questionsResponse = await testService.getTestQuestions(testId);
                    console.log('Questions Response:', questionsResponse);

                    // Ensure we have a valid questions response
                    if (!questionsResponse) {
                        throw new Error('Invalid questions response');
                    }

                    // Additional null checks
                    if (!questionsResponse.questions || !questionsResponse.test_name) {
                        throw new Error('Missing questions or test name');
                    }

                    set(state => {
                        state.currentTestResult = testResultResponse.data;
                        state.currentTestQuestions = questionsResponse.questions;
                        state.currentTestName = questionsResponse.test_name;
                        state.isLoading = false;
                    });

                    return testResultResponse.data;
                } catch (error: any) {
                    console.error('Error in startTest:', error);
                    set(state => {
                        state.error = error.message || 'Failed to start test';
                        state.isLoading = false;
                    });
                    return null;
                }
            },

            fetchAllTests: async () => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    const response = await testService.getAllTests();
                    console.log('All tests response:', response);

                    set(state => {
                        state.tests = response.data.tests;
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    console.error('Error fetching all tests:', error);
                    set(state => {
                        state.error = error.message || 'Failed to fetch tests';
                        state.isLoading = false;
                    });
                }
            },

            fetchTestById: async (id: number) => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    const response = await testService.getTestById(id);

                    set(state => {
                        state.currentTest = response.data;
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    console.error('Error fetching test by ID:', error);
                    set(state => {
                        state.error = error.message || 'Failed to fetch test';
                        state.isLoading = false;
                    });
                }
            },

            fetchTestQuestions: async (testId: number): Promise<Question[]> => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    const questionsResponse = await testService.getTestQuestions(testId);
                    console.log('Fetched questions response:', questionsResponse);

                    set(state => {
                        state.currentTestQuestions = questionsResponse.questions;
                        state.currentTestName = questionsResponse.test_name;
                        state.isLoading = false;
                    });

                    return questionsResponse.questions;
                } catch (error: any) {
                    console.error('Error fetching test questions:', error);
                    set(state => {
                        state.error = error.message || 'Failed to fetch test questions';
                        state.isLoading = false;
                    });
                    return [];
                }
            },

            fetchTestResult: async (id: number) => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    const response = await testService.getTestResult(id);
                    console.log('Fetched test result:', response);

                    set(state => {
                        state.currentTestResult = response.data;
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    console.error('Error fetching test result:', error);
                    set(state => {
                        state.error = error.message || 'Failed to fetch test result';
                        state.isLoading = false;
                    });
                }
            },

            fetchUserTestResults: async (userId: number) => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    console.log(`Fetching test results for user ID: ${userId}`);
                    const response = await testService.getUserTestResults(userId);
                    console.log('User test results response:', response);

                    // Check if we have valid data
                    if (!response) {
                        throw new Error('Invalid response format');
                    }

                    // Ensure we're setting an array
                    const resultsArray = Array.isArray(response) ? response : [];

                    console.log('Setting user test results:', resultsArray);

                    set(state => {
                        state.userTestResults = resultsArray;
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    console.error('Error fetching user test results:', error);
                    set(state => {
                        state.error = error.message || 'Failed to fetch test history';
                        state.isLoading = false;
                        state.userTestResults = []; // Set to empty array on error to prevent undefined
                    });
                }
            },

            saveAnswers: async (testResultId: number, answers: Answer[]) => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    console.log(`Saving answers for test result ID: ${testResultId}`, answers);
                    const response = await testService.saveAnswers(testResultId, answers);
                    console.log('Save answers response:', response);

                    set(state => { state.isLoading = false; });
                } catch (error: any) {
                    console.error('Error saving answers:', error);
                    set(state => {
                        state.error = error.message || 'Failed to save answers';
                        state.isLoading = false;
                    });
                }
            },

            completeTest: async (testResultId: number) => {
                set(state => { state.isLoading = true; state.error = null; });

                try {
                    console.log(`Completing test with ID: ${testResultId}`);
                    const response = await testService.completeTest(testResultId);
                    console.log('Complete test response:', response);

                    set(state => {
                        state.currentTestResult = response.data;
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    console.error('Error completing test:', error);
                    set(state => {
                        state.error = error.message || 'Failed to complete test';
                        state.isLoading = false;
                    });
                }
            }
        })),
        {
            name: QUIZ_STORE,
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