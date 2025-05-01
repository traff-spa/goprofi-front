import { testService } from '@app/api/services/testService';
import { Question, Answer } from '@/app/types';

/**
 * Calculate progress percentage based on current step and total questions
 * @param currentStep - Current question index
 * @param totalQuestions - Total number of questions
 * @returns Progress percentage (0-100)
 */
export const calculateProgressPercentage = (currentStep: number, totalQuestions: number): number => {
    return totalQuestions > 0 ? ((currentStep + 1) / totalQuestions) * 100 : 0;
};

/**
 * Fetch test questions by test ID
 * @param testId - ID of the test
 * @returns Array of questions
 */
export const fetchTestQuestions = async (testId: number): Promise<Question[]> => {
    try {
        const questionsResponse = await testService.getTestQuestions(testId);
        return questionsResponse.questions;
    } catch (error) {
        console.error('Error fetching test questions:', error);
        return [];
    }
};

/**
 * Fetch test result by ID
 * @param testResultId - ID of the test result
 * @returns Test result data or null if error
 */
export const fetchTestResult = async (testResultId: number) => {
    try {
        return await testService.getTestResult(testResultId);
    } catch (error) {
        console.error('Error fetching test result:', error);
        return null;
    }
};

/**
 * Save user's answer for a question
 * @param testResultId - ID of the test result
 * @param questionId - ID of the question
 * @param selectedOptionId - ID of the selected option
 * @returns Success status
 */
export const saveAnswer = async (
    testResultId: number,
    questionId: number,
    selectedOptionId: number
): Promise<boolean> => {
    try {
        const answer: Answer = {
            question_id: questionId,
            selected_option_id: selectedOptionId
        };

        await testService.saveAnswers(testResultId, [answer]);
        return true;
    } catch (error) {
        console.error('Error saving answer:', error);
        return false;
    }
};

/**
 * Complete the test and mark it as finished
 * @param testResultId - ID of the test result
 * @returns Success status
 */
export const completeTest = async (testResultId: number): Promise<boolean> => {
    try {
        await testService.completeTest(testResultId);
        return true;
    } catch (error) {
        console.error('Error completing test:', error);
        return false;
    }
};
