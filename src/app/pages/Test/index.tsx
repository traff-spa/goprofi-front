import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import '@app/styles/test.scss'
import TestStepper from '@components/TestStepper.tsx'
import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';

const Test = () => {
  // const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTestResult,
    completeTest,
    resetCurrentTest,
    currentTestQuestions
  } = useTestStore();
  const [isCompleted, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    console.log('Current Test Result:', currentTestResult);
    console.log('Current Test Questions:', currentTestQuestions);

    // If there's no current test result or user, redirect to main page
    if (!currentTestResult || !user) {
      navigate(ROUTES.MAIN);
    }

    // Cleanup on unmount
    return () => {
      resetCurrentTest();
    }
  }, [currentTestResult, user, navigate, resetCurrentTest]);

  const handleTestCompletion = async () => {
    if (currentTestResult) {
      try {
        await completeTest(currentTestResult.id);
        navigate(`/results/${currentTestResult.id}`);
      } catch (error) {
        console.error('Failed to complete test', error);
        // TODO: Add error handling UI
      }
    }
  }

  if (!currentTestResult) {
    return null; // or loading state
  }

  return (
      <div className="test-container">
        {!isCompleted ? (
            <TestStepper
                testResultId={currentTestResult.id}
                setCompleted={setCompleted}
            />
        ) : (
            <div className="test-completion">
              <h2>Тест завершено</h2>
              <p>Дякуємо за проходження тесту!</p>
              <button
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