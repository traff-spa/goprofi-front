import { TestResult } from '@/app/types';

/**
 * Validates a user ID and converts it to a number
 * @param userId - User ID to validate (can be string or number)
 * @returns Validated numeric user ID
 * @throws Error if user ID is invalid
 */
export const validateUserId = (userId: string | number): number => {
    const numericId = parseInt(userId.toString(), 10);

    if (isNaN(numericId)) {
        throw new Error(`Invalid user ID: ${userId}`);
    }

    return numericId;
};

/**
 * Checks if the user has any completed test results
 * @param testResults - Array of test results
 * @returns True if there are no test results
 */
export const hasNoTestResults = (testResults: TestResult[] | null): boolean => {
    return !testResults || testResults.length === 0;
};

/**
 * Gets test status text based on completion status
 * @param completedAt - Date when the test was completed, or null if not completed
 * @returns Status text
 */
export const getTestStatusText = (completedAt: Date | string | null): string => {
    return completedAt ? 'Завершено' : 'У процесі';
};

/**
 * Gets test progress percentage
 * @param completedAt - Date when test was completed, or null if not completed
 * @param progress - Current progress percentage if not completed
 * @returns Progress percentage (0-100)
 */
export const getTestProgress = (completedAt: Date | string | null, progress?: number | null | undefined): number => {
    return completedAt ? 100 : (progress || 0);
};

/**
 * Gets the appropriate link text for a test result
 * @param completedAt - Date when test was completed, or null if not completed
 * @returns Link text
 */
export const getTestLinkText = (completedAt: Date | string | null): string => {
    return completedAt ? 'Результат тесту' : 'Продовжити тест';
};

/**
 * Generates the appropriate URL for a test result
 * @param testId - ID of the test
 * @param completedAt - Date when test was completed, or null if not completed
 * @returns URL for test result or test continuation
 */
export const getTestUrl = (testId: number, completedAt: Date | string | null): string => {
    return completedAt ? `/results/${testId}` : `/test/${testId}`;
};
