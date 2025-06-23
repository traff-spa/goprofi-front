import { useState, useEffect } from 'react';
import { fetchTestQuestions, fetchTestResult } from '@app/helpers/testHelpers';
import {Question, UseTestDataReturn} from '@/app/types';

export const useTestData = (testResultId: number): UseTestDataReturn => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!testResultId) return;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const testResult = await fetchTestResult(testResultId);

                if (testResult?.test_id) {
                    const fetchedQuestions = await fetchTestQuestions(testResult.test_id);
                    setQuestions(fetchedQuestions);
                } else {
                    setError('Test result not found');
                }
            } catch (err) {
                setError('Failed to load test data');
                console.error('Test data loading error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [testResultId]);

    return { questions, isLoading, error };
};