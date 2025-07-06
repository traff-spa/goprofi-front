import { useState, FC, useEffect, useCallback } from 'react';
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';

import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import { useNavigate } from 'react-router-dom';

import '@app/styles/test.scss';
import { Answer, Props, Question } from '@/app/types';

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

  const setIsTestPage = useTestStore(state => state.setIsTestPage);
  const setTestTitle = useTestStore(state => state.setTestTitle);
  const saveTestPosition = useTestStore(state => state.saveTestPosition);
  const getTestPosition = useTestStore(state => state.getTestPosition);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(() => testResultId ? getTestPosition(testResultId) : 0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<{[key: number]: number | number[]}>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  const [isTieBreaker, setIsTieBreaker] = useState<boolean>(false);
  const [scenarioType, setScenarioType] = useState<string | null>(null);

  const progressPercentage = calculateProgressPercentage(currentStep, totalQuestions);

  useEffect(() => {
    setIsTestPage(true);
    setTestTitle('"Хто я"');
    return () => {
      setIsTestPage(false);
      setTestTitle('');
    };
  }, [setIsTestPage, setTestTitle]);

  useEffect(() => {
    if (!testResultId || currentTestQuestions.length > 0) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const testResult = await fetchTestResult(testResultId);
        if (testResult?.result_data?.requires_tie_breaker) {
          setIsTieBreaker(true);
          const tieBreakerData = await fetchTieBreakerQuestions(testResult.id);
          if (tieBreakerData?.questions?.length > 0) {
            const formattedQuestions = tieBreakerData?.questions?.map((q: any) => ({ ...q, id: q.pair_id || q.id }));
            setScenarioType(tieBreakerData?.scenario_type);
            setCurrentTestQuestions(formattedQuestions);
            setTotalQuestions(formattedQuestions?.length);
            setCurrentStep(0);
            setCurrentQuestion(formattedQuestions[0]);
          }
        } else if (testResult?.id) {
          const questions = await fetchTestQuestions(testResult.test_id);
          setCurrentTestQuestions(questions);
          setTotalQuestions(questions.length);
          const savedStep = getTestPosition(testResultId);
          const validStep = Math.min(savedStep, questions.length > 0 ? questions.length - 1 : 0);
          setCurrentStep(validStep);
          setCurrentQuestion(questions[validStep]);
        }
      } catch (error) {
        console.error('Error fetching initial test data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [testResultId, currentTestQuestions.length, getTestPosition]);

  useEffect(() => {
    if (currentTestQuestions.length > 0 && currentStep < currentTestQuestions.length) {
      setCurrentQuestion(currentTestQuestions[currentStep]);
    }
  }, [currentStep, currentTestQuestions]);

  useEffect(() => {
    if (testResultId && currentStep >= 0 && !isTieBreaker) {
      saveTestPosition(testResultId, currentStep);
    }
  }, [currentStep, testResultId, saveTestPosition, isTieBreaker]);

  const submitTieBreakers = async (finalAnswers: { [key: number]: number | number[] }) => {
    if (!scenarioType || !testResultId) {
      console.error("Scenario type or testResultId is missing!");
      return;
    }

    setLoading(true);
    try {
      let answersPayload: Answer[] = [];

      if (scenarioType === 'scenario_3') {
        const questionId = Object.keys(finalAnswers)[0];
        const selectedOptionIds = (finalAnswers[Number(questionId)] as number[] | undefined) || [];
        const question = currentTestQuestions.find(q => q.id === Number(questionId));

        answersPayload = selectedOptionIds?.map((optionId) => {
          const selectedOption = question?.options?.find((opt) => opt?.id === optionId);

          return {
            question_id: Number(questionId),
            selected_option_id: optionId,
            personality_type_id: selectedOption?.personality_type_id ?? undefined,
            is_tie_breaker: true,
          };
        });
      } else {
        answersPayload = Object.entries(finalAnswers)?.map(([questionId, selectedOptionId]) => {
          const question = currentTestQuestions.find((q) => q?.id === Number(questionId));
          const selectedOption = question?.options?.find((opt) => opt?.id === Number(selectedOptionId));

          return {
            question_id: Number(questionId),
            selected_option_id: Number(selectedOptionId),
            personality_type_id: selectedOption?.personality_type_id ?? undefined,
            is_tie_breaker: true,
          };
        });
      }

      const response = await submitAllTieBreakerAnswers(testResultId, answersPayload, scenarioType);

      if (response && response?.questions && response?.questions?.length > 0) {
        const { questions, scenario_type } = response;
        const formattedQuestions = questions?.map((q: any) => ({ ...q, id: q.pair_id || q.id }));
        
        setScenarioType(scenario_type || 'scenario_3');
        setCurrentTestQuestions(formattedQuestions);
        setTotalQuestions(formattedQuestions.length);
        setCurrentStep(0);
        setLocalAnswers({});
      } else {
        setCompleted(true);
        navigate(`/results/${testResultId}`);
      }
    } catch (error) {
      console.error("Failed to submit tie-breaker answers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(async (newlySelectedOptionId?: number) => {
    if (loading || !currentQuestion) return;

    setLoading(true);
    try {
      const questionId = currentQuestion.id;
      const optionId = newlySelectedOptionId ?? (localAnswers[questionId] as number);

      if (optionId === undefined) {
        setLoading(false);
        return;
      }

      const isLastStep = currentStep === totalQuestions - 1;

      if (isTieBreaker) {
        if (isLastStep) {
          const finalAnswers = { ...localAnswers, [questionId]: optionId };
          await submitTieBreakers(finalAnswers);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        await saveAnswer(testResultId, questionId, optionId);
        if (isLastStep) {
          const completeTestData = await completeTest(testResultId);
          if (completeTestData?.requires_tie_breaker) {
            setIsTieBreaker(true);
            const tieBreakerData = await fetchTieBreakerQuestions(completeTestData.id);
            if (tieBreakerData?.questions?.length > 0) {
              const { questions, scenario_type } = tieBreakerData;
              const formattedQuestions = questions.map((q: any) => ({ ...q, id: q.pair_id || q.id }));
              setScenarioType(scenario_type);
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
    testResultId, setCompleted, navigate, scenarioType, submitTieBreakers
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0 && !isTieBreaker) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, isTieBreaker]);

  const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
    if (loading) return;

    if (isTieBreaker && scenarioType === 'scenario_3') {
      setLocalAnswers(prev => {
        const currentSelection = (prev[questionId] as number[] | undefined) || [];
        const newSelection = currentSelection.includes(optionId)
          ? currentSelection.filter(id => id !== optionId)
          : [...currentSelection, optionId];
        return { ...prev, [questionId]: newSelection };
      });
    } else {
      setLocalAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      handleNext(optionId);
    }
  }, [loading, isTieBreaker, scenarioType, handleNext]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalQuestions - 1;
  
  const isButtonVisible = !loading && currentQuestion && (
    (localAnswers[currentQuestion.id] && !(Array.isArray(localAnswers[currentQuestion.id]) && (localAnswers[currentQuestion.id] as number[]).length === 0))
  )

  const cursorStyle = { cursor: loading ? 'wait' : 'pointer' };

  if (!currentQuestion && loading) {
    return (
      <div className="test-section" style={{ justifyContent: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div
        className="test-section"
        style={{
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
        Питання не знайдено.
      </div>
    )
  }

  const getTitle = () => {
    if (!isTieBreaker) return 'Питання';
    if (scenarioType !== 'scenario_3') return 'Додаткові питання';
    return 'Додаткове запитання: виберіть один або декілька варіантів';
  }

  const getCounter = () => scenarioType !== 'scenario_3' ? `${currentStep + 1} з ${totalQuestions}` : ''

  return (
    <div className="test-section">
      <div className="test-section__body">
        {isTieBreaker && (
          <div className="test-section__subtitle">
            Вау! А ти цікава особистість, хочемо краще дослідити твій тип
          </div>
        )}
        <div className="test-section__title">
          {getTitle()} {getCounter()}
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
            {currentQuestion?.options?.map((option) => {
              const isChecked = isTieBreaker && scenarioType === 'scenario_3'
                ? ((localAnswers[currentQuestion.id] as number[]) || []).includes(option.id)
                : localAnswers[currentQuestion.id] === option.id;

              return (
                <div
                  key={`${option.id}-${Math.random()}`}
                  className="questions__item"
                  onClick={() => !loading && handleOptionSelect(currentQuestion.id, option.id)}
                  style={cursorStyle}
                >
                  <div className="radio-wrapper">
                    <input
                      type={isTieBreaker && scenarioType === 'scenario_3' ? 'checkbox' : 'radio'}
                      id={`option-${option.id}`}
                      name={`question-${currentQuestion.id}`}
                      value={option.id.toString()}
                      checked={isChecked}
                      onChange={() => {}}
                    />
                    <span className={isChecked ? 'selected' : ''} style={cursorStyle}>
                      {option.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="test-section__footer">
        <button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep || loading || isTieBreaker}
            className="test-section__back-btn"
        >
          Назад
        </button>
        {isButtonVisible && (
          <button
            type="button"
            onClick={() => {
              if (isTieBreaker && scenarioType === 'scenario_3') {
                submitTieBreakers(localAnswers);
              } else {
                handleNext();
              }
            }}
            disabled={loading}
            className="test-section__next-btn"
          >
            {isLastStep ? 'Завершити' : 'Далі'}
            <ArrowIcon width={17} height={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default TestStepper;