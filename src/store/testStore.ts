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
    // testStepper props
    isTestPage: false,
    isTestResultPage: false,
    testTitle: '',
    // Tie-breaking properties
    tieBreakingQuestions: [],
    tiedTypes: [],
    isTieBreaking: false,
    // Track when answers are saved to force UI updates
    lastSavedAnswerTimestamp: 0,
    testPositions: {}
};

export const useTestStore = create<TestStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            resetCurrentTest: () => {
                set({
                    currentTest: null,
                    currentTestResult: null,
                    currentTestQuestions: [],
                    currentTestName: '',
                    lastSavedAnswerTimestamp: 0,
                });
            },

            setIsTestPage: (isTestPage: boolean) => set({ isTestPage }),
            setIsTestResultPage: (isTestResultPage: boolean) => set({ isTestResultPage }),
            setTestTitle: (testTitle: string | null) => set({ testTitle }),

            startTest: async (userId: number, testId: number): Promise<TestResult | null> => {
                set({ isLoading: true, error: null });

                try {
                    // Start the test first
                    const testResult = await testService.startTest(userId, testId);

                    // Fetch the questions
                    const questionsResponse = await testService.getTestQuestions(testId);

                    // Ensure we have a valid questions response
                    if (!questionsResponse?.questions || !questionsResponse?.test_name) {
                        throw new Error('Invalid questions response');
                    }

                    set({
                        currentTestResult: testResult,
                        currentTestQuestions: questionsResponse.questions,
                        currentTestName: questionsResponse.test_name,
                        isLoading: false,
                        lastSavedAnswerTimestamp: Date.now(),
                    });

                    return testResult;
                } catch (error: any) {
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

                    set({
                        tests: response.tests,
                        isLoading: false
                    });

                    return response.tests;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch tests',
                        isLoading: false
                    });
                    return [];
                }
            },

            fetchTestById: async (id: number) => {
                set({ isLoading: true, error: null });

                try {
                    const test = await testService.getTestById(id);

                    set({
                        currentTest: test,
                        isLoading: false
                    });

                    return test;
                } catch (error: any) {
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

                    set({
                        currentTestQuestions: questionsResponse.questions,
                        currentTestName: questionsResponse.test_name,
                        isLoading: false
                    });

                    return questionsResponse.questions;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to fetch test questions',
                        isLoading: false
                    });
                    return [];
                }
            },

            fetchTestResult: async (id: number): Promise<TestResult | null> => {
                set({ isLoading: true, error: null });

                try {
                    const testResult = await testService.getTestResult(id);

                    set({
                        currentTestResult: testResult,
                        isLoading: false
                    });

                    return testResult;
                } catch (error: any) {
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
                        response_value: answer.selected_option_id,
                        is_tie_breaker: false
                    }));

                    const response = await testService.saveAnswers(testResultId, formattedAnswers);

                    // Update timestamp to force components to re-render
                    set({
                        isLoading: false,
                        lastSavedAnswerTimestamp: Date.now()
                    });

                    return response;
                } catch (error: any) {
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
                    const result = await testService.completeTest(testResultId);

                    set({
                        currentTestResult: result,
                        isLoading: false
                    });

                    return result;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to complete test',
                        isLoading: false
                    });
                    return null;
                }
            },

            // Tie-breaking functionality
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
                    // Use get() to actually use the current state
                    const isTieBreaking = get().isTieBreaking;

                    // Verify that tie-breaking is actually in progress
                    if (!isTieBreaking) {
                        console.warn("Attempting to save tie-breaker answers when not in tie-breaking mode");
                    }

                    // Mark these answers as tie breakers
                    const tieBreakerAnswers = answers.map(answer => ({
                        ...answer,
                        is_tie_breaker: true
                    }));

                    const result = await testService.saveTieBreakerAnswers(testResultId, tieBreakerAnswers);

                    set({
                        currentTestResult: result,
                        isTieBreaking: false,
                        isLoading: false,
                        lastSavedAnswerTimestamp: Date.now()
                    });

                    return result;
                } catch (error: any) {
                    set({
                        error: error.message || 'Failed to save tie-breaker answers',
                        isLoading: false
                    });
                    return null;
                }
            },

            saveTestPosition: (testResultId: number, position: number) => {
                set(state => ({
                    testPositions: {
                        ...state.testPositions,
                        [testResultId]: position
                    }
                }));
            },

            getTestPosition: (testResultId: number): number => {
                const positions = get().testPositions;
                return positions[testResultId] || 0;
            },

            testPositions: initialState.testPositions,
            // Add the timestamp field to the store state
            lastSavedAnswerTimestamp: initialState.lastSavedAnswerTimestamp
        }),
        {
            name: 'test-store',
            partialize: (state) => ({
                tests: state.tests,
                currentTest: state.currentTest,
                currentTestResult: state.currentTestResult,
                userTestResults: state.userTestResults,
                testPositions: state.testPositions,
            }),
        }
    )
);

// Selector hooks with proper dependencies to trigger re-renders
export const useTests = () => useTestStore(state => state.tests);
export const useCurrentTest = () => useTestStore(state => state.currentTest);
export const useCurrentTestResult = () => useTestStore(state => state.currentTestResult);

// This selector now properly includes the timestamp in its dependencies
export const useCurrentTestQuestions = () => {
    const store = useTestStore(state => ({
        questions: state.currentTestQuestions,
        timestamp: state.lastSavedAnswerTimestamp
    }));
    // Return just the questions - the timestamp is only used to force re-renders
    return store.questions;
};

export const useTestLoading = () => useTestStore(state => state.isLoading);
export const useTestError = () => useTestStore(state => state.error);

