import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import '@app/styles/test.scss'
import TestStepper from '@app/components/TestStepper'
import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';

const Test = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTestResult,
    completeTest,
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
    // If there's no user, redirect to login
    if (!user) {
      navigate(ROUTES.AUTH);
      return;
    }

    // Load test data and find saved answers - MINIMAL CHANGES
    const loadTestData = async () => {
      if (id && !dataFetched.current) {
        dataFetched.current = true; // Mark as fetched to prevent multiple calls

        try {
          setIsLoadingAnswers(true);
          console.log(`Loading test data for test result ID: ${id}`);

          // First fetch the test result
          const testResult = await fetchTestResult(parseInt(id, 10));

          if (testResult) {
            // Then fetch the questions for this test
            await fetchTestQuestions(testResult.test_id);

            // Get saved answers
            const savedAnswers = await fetchUserAnswers(testResult.id);
            setInitialAnswers(savedAnswers);
          }

          setIsLoadingAnswers(false);
        } catch (error) {
          console.error('Failed to load test data:', error);
          setIsLoadingAnswers(false);
          dataFetched.current = false; // Reset on error to allow retrying
        }
      }
    };

    loadTestData();

    // CRITICAL FIX: Only reset the test on actual component unmount
    return () => {
      // When navigating away, safely reset the test state
      setTimeout(() => resetCurrentTest(), 100);
    };
  }, [id, user, navigate, resetCurrentTest, fetchTestResult, fetchTestQuestions]);

  // Fetch user's answers
  const fetchUserAnswers = async (testResultId: number) => {
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

      // If there's progress but no saved answers, create dummy answers
      if (currentTestResult?.progress && currentTestQuestions.length > 0) {
        const answeredCount = Math.floor((currentTestQuestions.length * currentTestResult.progress) / 100);
        const dummyAnswers: {[key: number]: number} = {};

        for (let i = 0; i < answeredCount && i < currentTestQuestions.length; i++) {
          const question = currentTestQuestions[i];
          if (question.options.length > 0) {
            dummyAnswers[question.id] = question.options[0].id;
          }
        }

        return dummyAnswers;
      }

      return {};
    } catch (error) {
      console.error("Error fetching user answers:", error);
      return {};
    }
  };

  const handleTestCompletion = async () => {
    if (currentTestResult) {
      try {
        await completeTest(currentTestResult.id);
        navigate(`/results/${currentTestResult.id}`);
      } catch (error) {
        console.error('Failed to complete test', error);
      }
    }
  }

  if (isLoading || isLoadingAnswers) {
    return (
        <div className="test-container">
          <div>Завантаження тесту...</div>
        </div>
    );
  }

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
              <h2>Тест завершено</h2>
              <p>Дякуємо за проходження тесту!</p>
              <button
                  type="button"
                  onClick={handleTestCompletion}
                  className="test-results-btn"
              >
                Переглянути результати
              </button>
            </div>
        )}
      </div>
  )
}

export default Test;