import { useState, FC, useEffect, useCallback } from 'react';
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';

import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import { useNavigate } from 'react-router-dom';

import '@app/styles/test.scss';
import { Props, Question } from '@/app/types';

import {
  calculateProgressPercentage,
  fetchTestQuestions,
  fetchTestResult,
  saveAnswer,
  completeTest,
} from '@app/helpers/testHelpers';

import { useTestStore } from '@/store/testStore';

const TestStepper: FC<Props> = ({ testResultId, setCompleted, initialAnswers = {} }) => {
  const navigate = useNavigate();

  // Get the setIsTestPage and setTestTitle functions
  const setIsTestPage = useTestStore(state => state.setIsTestPage);
  const setTestTitle = useTestStore(state => state.setTestTitle);

  // Get position functions from testStore
  const saveTestPosition = useTestStore(state => state.saveTestPosition);
  const getTestPosition = useTestStore(state => state.getTestPosition);

  // State management
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // Initialize from Zustand store instead of localStorage
  const [currentStep, setCurrentStep] = useState<number>(() => {
    return testResultId ? getTestPosition(testResultId) : 0;
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<{[key: number]: number}>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);

  const progressPercentage = calculateProgressPercentage(currentStep, totalQuestions);

  useEffect(() => {
    setIsTestPage(true);
    setTestTitle('Тест "Хто я"');

    // Clean up when a component unmounts
    return () => {
      setIsTestPage(false);
      setTestTitle('');
    };
  }, []);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        if (testResultId) {
          // Get test result to find the test ID
          const testResult = await fetchTestResult(testResultId);

          if (testResult && testResult.test_id) {
            // Fetch all questions to get the total count
            const questions = await fetchTestQuestions(testResult.test_id);
            setCurrentTestQuestions(questions);
            setTotalQuestions(questions.length);

            // Get saved position from Zustand
            const savedStep = getTestPosition(testResultId);

            // Ensure saved step is within valid range
            const validStep = Math.min(savedStep, questions.length - 1);

            // Set current step and question based on saved position
            if (validStep !== currentStep) {
              setCurrentStep(validStep);
            }

            // Set the correct question based on the current step
            if (questions.length > 0) {
              setCurrentQuestion(questions[validStep]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testResultId, currentStep, getTestPosition]);

  useEffect(() => {
    if (testResultId && currentStep >= 0) {
      saveTestPosition(testResultId, currentStep);
    }
  }, [currentStep, testResultId, saveTestPosition]);

  const handleOptionSelect = useCallback(async (questionId: number, optionId: number) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      setLocalAnswers(prev => ({
        ...prev,
        [questionId]: optionId
      }));

      await saveAnswer(testResultId, questionId, optionId);
      console.log('Answer saved:', { testResultId, questionId, optionId });

      if (currentStep === totalQuestions - 1) {
        await completeTest(testResultId);
        setCompleted(true);
        navigate(`/results/${testResultId}`);
        return;
      }

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveTestPosition(testResultId, nextStep);

      if (currentTestQuestions[nextStep]) {
        setCurrentQuestion(currentTestQuestions[nextStep]);
      }

    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, testResultId, currentStep, totalQuestions, currentTestQuestions, navigate, saveTestPosition, setCompleted]);

  // Handle next button click
  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    try {
      setLoading(true);

      // Save the current answer
      await saveAnswer(testResultId, currentQuestion.id, localAnswers[currentQuestion.id]);

      if (currentStep === totalQuestions - 1) {
        // Complete the test
        await completeTest(testResultId);

        setCompleted(true);

        // Navigate to the result page with the test result ID
        navigate(`/results/${testResultId}`);
        return;
      }

      // Move to the next question
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Save progress to Zustand
      saveTestPosition(testResultId, nextStep);

      // Get the next question from our already loaded questions
      if (currentTestQuestions[nextStep]) {
        setCurrentQuestion(currentTestQuestions[nextStep]);
      }
    } catch (error) {
      console.error('Error saving answer or fetching next question:', error);
    } finally {
      setLoading(false);
    }
  }, [currentQuestion, currentStep, localAnswers, testResultId, totalQuestions, currentTestQuestions, navigate, saveTestPosition]);

  // Handle back button click
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      // Save progress to Zustand
      saveTestPosition(testResultId, prevStep);

      setCurrentQuestion(currentTestQuestions[prevStep]);
    }
  }, [currentStep, currentTestQuestions, testResultId, saveTestPosition]);

  // UI states
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalQuestions - 1;
  const isOptionSelected = currentQuestion ? !!localAnswers[currentQuestion.id] : false;

  const cursorStyle = { cursor: loading ? 'wait' : 'pointer' };

  if (!currentQuestion) {
    return (
      <div className="test-section" style={{ justifyContent: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    )
  }

  return (
    <div className="test-section">
      <div className="test-section__body">
        <div className="test-section__title">
          Питання {currentStep + 1} з {totalQuestions}
        </div>
        <div className="test-section__progress">
          <div
              className="test-section__progress-bar"
              style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="questions">
          <div className="questions__title">{currentQuestion.text}</div>
          <div className="questions__list">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className="questions__item"
                onClick={() => {
                  if (!loading) {
                    handleOptionSelect(currentQuestion.id, option.id);
                  }
                }}
                style={cursorStyle}
              >
                <div className="radio-wrapper">
                  <input
                      type="radio"
                      id={`option-${option.id}`}
                      name={`question-${currentQuestion.id}`}
                      value={option.id.toString()}
                      checked={localAnswers[currentQuestion.id] === option.id}
                      onChange={()=>{}}
                  />
                  <span
                      className={localAnswers[currentQuestion.id] === option.id ? 'selected' : ''}
                      style={cursorStyle}
                  >
                  {option.text}
                </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="test-section__footer">
        <button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep || loading}
            className="test-section__back-btn"
        >
          Назад
        </button>
        {isOptionSelected && !loading && (
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="test-section__next-btn"
          >
            {isLastStep ? 'Завершити' : 'Далі'}
            <ArrowIcon width={17} height={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default TestStepper;