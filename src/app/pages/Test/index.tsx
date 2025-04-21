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
  // Add a mount reference to prevent state updates after unmount
  const isMounted = useRef(true);

  // Set the mounted ref on initial render and handle cleanup
  useEffect(() => {
    isMounted.current = true;

    // Fix the nested cleanup issue by moving the timeout to here
    return () => {
      isMounted.current = false;
      // Safely reset test state with a slight delay to avoid conflicts
      setTimeout(() => {
        resetCurrentTest();
      }, 100);
    };
  }, [resetCurrentTest]); // Include resetCurrentTest in dependency array

  // Separate auth check from data loading to avoid race conditions
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH);
    }
  }, [user, navigate]);

  // Fetch user's answers - extracted as a separate function for clarity
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

  // Data loading effect - separated for clarity
  useEffect(() => {
    // Prevent execution if user is not authenticated or already fetched
    if (!user || !id || dataFetched.current) {
      return;
    }

    const loadTestData = async () => {
      try {
        dataFetched.current = true;
        setIsLoadingAnswers(true);

        // First fetch the test result
        const testResult = await fetchTestResult(parseInt(id, 10));

        // Only continue if component is still mounted
        if (!isMounted.current) return;

        if (testResult) {
          // Fetch questions for this test
          await fetchTestQuestions(testResult.test_id);

          // Only continue if component is still mounted
          if (!isMounted.current) return;

          // Get saved answers from localStorage
          const savedAnswers = await fetchUserAnswers(testResult.id);

          // Only set state if component is still mounted
          if (isMounted.current) {
            setInitialAnswers(savedAnswers);
            setIsLoadingAnswers(false);
          }
        } else if (isMounted.current) {
          setIsLoadingAnswers(false);
          dataFetched.current = false; // Reset so we can try again
        }
      } catch (error) {
        console.error('Failed to load test data:', error);
        if (isMounted.current) {
          setIsLoadingAnswers(false);
          dataFetched.current = false; // Reset on error to allow retrying
        }
      }
    };

    loadTestData();
  }, [id, user, fetchTestResult, fetchTestQuestions, fetchUserAnswers]);

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
            <div className="test-completion">
              <TestResult/>
            </div>
        )}
      </div>
  );
};

export default Test;