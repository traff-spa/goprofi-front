import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import '@app/styles/test.scss'
import TestStepper from '@app/components/TestStepper'
import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';
import TestResult from "@app/pages/TestResult";

const Test = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTestResult,
    resetCurrentTest,
    currentTestQuestions,
    fetchTestResult,
    fetchTestQuestions,
    isLoading,
    error
  } = useTestStore();

  const [isCompleted, setCompleted] = useState<boolean>(false);
  const [initialAnswers, setInitialAnswers] = useState<{[key: number]: number}>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState<boolean>(true);
  const dataFetched = useRef(false);

  useEffect(() => {
    return () => {
      // Only reset if we are actually navigating away from the test page
      if (!isCompleted) {
        resetCurrentTest();
      }
    };
  }, [resetCurrentTest, isCompleted]);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH);
    }
  }, [user, navigate]);

  const fetchUserAnswers = useCallback(async (testResultId: number) => {
    try {
      // Check localStorage first
      const savedAnswersKey = `test_${testResultId}_answers`;
      const savedAnswersStr = localStorage.getItem(savedAnswersKey);

      if (savedAnswersStr) {
        try {
          return JSON.parse(savedAnswersStr);
        } catch (e) {
          console.error("Error parsing saved answers:", e);
        }
      }

      // If no saved answers, return empty object
      return {};
    } catch (error) {
      console.error("Error fetching user answers:", error);
      return {};
    }
  }, []);

  useEffect(() => {
    // Prevent execution if user is not authenticated or already fetched
    // Or if test is already completed (don't reload test data in completed state)
    if (!user || !id || dataFetched.current || isCompleted) {
      return;
    }

    const loadTestData = async () => {
      try {
        dataFetched.current = true;
        setIsLoadingAnswers(true);

        // First fetch the test result
        const testResult = await fetchTestResult(parseInt(id, 10));

        if (testResult) {
          // Fetch questions for this test
          await fetchTestQuestions(testResult.test_id);

          // Get saved answers from localStorage
          const savedAnswers = await fetchUserAnswers(testResult.id);

          setInitialAnswers(savedAnswers);
          setIsLoadingAnswers(false);
        } else {
          setIsLoadingAnswers(false);
          dataFetched.current = false; // Reset so we can try again
        }
      } catch (error) {
        console.error('Failed to load test data:', error);
        setIsLoadingAnswers(false);
        dataFetched.current = false; // Reset on error to allow retrying
      }
    };

    loadTestData();
  }, [id, user, fetchTestResult, fetchTestQuestions, fetchUserAnswers, isCompleted]);

  // Loading state
  if (isLoading || isLoadingAnswers) {
    return (
        <div className="test-container">
          <div>Завантаження тесту...</div>
        </div>
    );
  }

  // Error state
  if (error || !currentTestResult || currentTestQuestions.length === 0) {
    return (
        <div className="test-container">
          <div>
            <h2>Помилка завантаження тесту</h2>
            <p>{error || 'Тест не знайдено або виникла помилка.'}</p>
            <button
                onClick={() => navigate(ROUTES.MAIN)}
                className="test-results-btn"
                type="button"
            >
              Повернутися на головну
            </button>
          </div>
        </div>
    );
  }

  // Render test or completion screen
  return (
      <div className="test-container">
        {!isCompleted ? (
            <TestStepper
                testResultId={currentTestResult.id}
                setCompleted={setCompleted}
                initialAnswers={initialAnswers}
            />
        ) : (
            <TestResult />
        )}
      </div>
  );
};

export default Test;