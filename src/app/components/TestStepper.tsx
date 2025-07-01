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
  fetchTieBreakerQuestions,
  submitAllTieBreakerAnswers
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
  const [currentStep, setCurrentStep] = useState<number>(() => {
    return testResultId ? getTestPosition(testResultId) : 0;
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<{[key: number]: number}>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  const [isTieBreaker, setIsTieBreaker] = useState<boolean>(false);
  const [scenarioType, setScenarioType] = useState<string | null>(null);

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
    if (!testResultId || currentTestQuestions.length > 0) return

    const fetchInitialData = async () => {
      setLoading(true);

      try {
        const testResult = await fetchTestResult(testResultId);

        if (testResult?.result_data?.requires_tie_breaker) {
          setIsTieBreaker(true);
          
          const testId = testResult?.id;
          const tieBreakerData = await fetchTieBreakerQuestions(testId);
          const tieBreakerQuestions = tieBreakerData?.questions

          if (tieBreakerQuestions && tieBreakerQuestions?.length > 0) {
            const formattedQuestions = tieBreakerQuestions?.map((q: Question) => ({ ...q, id: q?.pair_id }));
            
            setScenarioType(tieBreakerData?.scenario_type);
            setCurrentTestQuestions(formattedQuestions);
            setTotalQuestions(formattedQuestions?.length);
            setCurrentStep(0);
            setCurrentQuestion(formattedQuestions[0]);
          }
          
        } else if (testResult && testResult?.id) {
          if (currentTestQuestions?.length > 0) {
            setLoading(false);
            return;
          }

          const questions = await fetchTestQuestions(testResult?.test_id);
          
          setCurrentTestQuestions(questions);
          setTotalQuestions(questions.length);

          const savedStep = getTestPosition(testResultId);
          const validStep = Math.min(savedStep, questions?.length - 1);
          setCurrentStep(validStep);
        }

      } catch (error) {
        console.error('Error fetching initial test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [testResultId, currentTestQuestions.length, getTestPosition, fetchTestResult, fetchTestQuestions]);

  useEffect(() => {
    if (currentTestQuestions?.length > 0 && currentStep < currentTestQuestions?.length) {
      setCurrentQuestion(currentTestQuestions[currentStep]);
    }
  }, [currentStep, currentTestQuestions]);

  useEffect(() => {
    if (testResultId && currentStep >= 0) {
      saveTestPosition(testResultId, currentStep);
    }
  }, [currentStep, testResultId, saveTestPosition]);

  const submitTieBreakers = async () => {
    if (!scenarioType) {
      console.error("Scenario type is missing! Cannot submit tie-breaker answers.");
      return;
    }

    setLoading(true);
    try {
      const answersPayload = Object?.entries(localAnswers)?.map(([questionId, selectedOptionId]) => {
        const question = currentTestQuestions.find((q) => q?.id === Number(questionId));
        const selectedOption = question?.options?.find((opt) => opt?.id === selectedOptionId);

        return {
          question_id: Number(questionId),
          selected_option_id: selectedOptionId,
          personality_type_id: selectedOption?.personality_type_id,
          is_tie_breaker: true,
        }
      })

      await submitAllTieBreakerAnswers(testResultId, answersPayload, scenarioType);

      setCompleted(true);
      navigate(`/results/${testResultId}`);

    } catch (error) {
      console.error("Failed to submit tie-breaker answers:", error);
    } finally {
      setLoading(false);
    }
  }

  // Handle next button click
  const handleNext = useCallback(async (newlySelectedOptionId?: number) => {
    if (loading || !currentQuestion) return;

    setLoading(true);
    try {
      const questionId = currentQuestion.id;
      const optionId = newlySelectedOptionId ?? localAnswers[questionId];

      if (optionId === undefined) {
        console.error("No option selected for the current question.");
        setLoading(false);
        return;
      }

      const isLastStep = currentStep === totalQuestions - 1;

      if (isTieBreaker) {
        if (isLastStep) {
          await submitTieBreakers();
        } else {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        await saveAnswer(testResultId, questionId, optionId);

        if (isLastStep) {
          const completeTestData = await completeTest(testResultId);
          if (completeTestData?.requires_tie_breaker) {
            const tieBreakerData = await fetchTieBreakerQuestions(completeTestData?.id);
            if (tieBreakerData && tieBreakerData.questions.length > 0) {
              const { questions, scenario_type } = tieBreakerData;
              const formattedQuestions = questions.map((q: Question) => ({ ...q, id: q?.pair_id }));
              
              setScenarioType(scenario_type);
              setIsTieBreaker(true);
              setCurrentTestQuestions(formattedQuestions);
              setTotalQuestions(formattedQuestions.length);
              setCurrentStep(0);
              setLocalAnswers({});
            } else {
              setCompleted(true);
              navigate(`/results/${testResultId}`);
            }
          } else {
            setCompleted(true);
            navigate(`/results/${testResultId}`);
          }
        } else {
          setCurrentStep(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
    } finally {
      setLoading(false);
    }
  }, [
    loading, currentQuestion, localAnswers, currentStep, totalQuestions, isTieBreaker, 
    testResultId, setCompleted, navigate, saveAnswer, completeTest, 
    fetchTieBreakerQuestions, submitTieBreakers
  ])

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

  // Handle select and next button
  const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
    if (loading) return;

    setLocalAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    handleNext(optionId);
  }, [loading, setLocalAnswers, handleNext]);

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
        {isTieBreaker && (
          <div className="test-section__subtitle">
            Вау! А ти цікава особистість, хочемо краще дослідити твій тип
          </div>
        )}

        <div className="test-section__title">
          {isTieBreaker ? 'Додаткові питання' : 'Питання'} {currentStep + 1} з {totalQuestions}
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
            {currentQuestion?.options?.map((option) => (
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