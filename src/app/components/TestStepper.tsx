import { useState, FC, useEffect, useCallback } from 'react';
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

  const setIsTestPage = useTestStore(state => state.setIsTestPage);
  const setTestTitle = useTestStore(state => state.setTestTitle);

  // Get position functions from testStore
  const saveTestPosition = useTestStore(state => state.saveTestPosition);
  const getTestPosition = useTestStore(state => state.getTestPosition);

  // State management

  // const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  // TODO: test for view multiply
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>({
    "id": 1,
    "text": "Для мене важливо, щоб усе було зроблено правильно та відповідало встановленим стандартам.",
    "isMultiple": true,
    "options": [
        {
          "id": 1,
          "text": "Вариант 1",
          "option_order": 1
        },
        {
          "id": 2,
          "text": "Вариант 2",
          "option_order": 2
        },
        {
          "id": 3,
          "text": "Вариант 3",
          "option_order": 3
        },
        {
          "id": 4,
          "text": "Вариант 4",
          "option_order": 4
        },
        {
          "id": 5,
          "text": "Вариант 5",
          "option_order": 5
        }
    ]
  });

  // Initialize from Zustand store instead of localStorage
  const [currentStep, setCurrentStep] = useState<number>(() => {
    return testResultId ? getTestPosition(testResultId) : 0;
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<{[key: number]: number}>(initialAnswers);
  const [loading, setLoading] = useState(false);

  // const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  // TODO: test for view multiply
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([
      {
          "id": 1,
          "text": "Для мене важливо, щоб усе було зроблено правильно та відповідало встановленим стандартам.",
          "isMultiple": true,
          "options": [
              {
                "id": 1,
                "text": "Вариант 1",
                "option_order": 1
              },
              {
                "id": 2,
                "text": "Вариант 2",
                "option_order": 2
              },
              {
                "id": 3,
                "text": "Вариант 3",
                "option_order": 3
              },
              {
                "id": 4,
                "text": "Вариант 4",
                "option_order": 4
              },
              {
                "id": 5,
                "text": "Вариант 5",
                "option_order": 5
              }
          ]
      },
      {
          "id": 2,
          "text": "Я відчуваю внутрішнє напруження, коли бачу, що щось робиться неправильно або недосконало.",
          "isMultiple": true,
          "options": [
              {
                "id": 6,
                "text": "Вариант 1",
                "option_order": 1
              },
              {
                "id": 7,
                "text": "Вариант 2",
                "option_order": 2
              },
              {
                "id": 8,
                "text": "Вариант 3",
                "option_order": 3
              },
              {
                "id": 9,
                "text": "Вариант 4",
                "option_order": 4
              },
              {
                "id": 10,
                "text": "Вариант 5",
                "option_order": 5
              }
          ]
      },
      {
          "id": 3,
          "text": "Я відчуваю задоволення, коли бачу, що моя робота відповідає високим стандартам якості.",
          "isMultiple": true,
          "options": [
              {
                "id": 10,
                "text": "Вариант 1",
                "option_order": 1
              },
              {
                "id": 11,
                "text": "Вариант 2",
                "option_order": 2
              },
              {
                "id": 12,
                "text": "Вариант 3",
                "option_order": 3
              }
          ]
      }
  ]);

  // Calculate progress percentage
  const progressPercentage = calculateProgressPercentage(currentStep, totalQuestions);

  // title and test flags, TODO: put this part into the backend
  useEffect(() => {
    setIsTestPage(true);
    setTestTitle('Тест "Хто я"');

    return () => {
      setIsTestPage(false);
      setTestTitle('');
    };
  }, []);

  // Fetch all questions on mount to get total count
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

            // Get saved position from store
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

  // TODO: OLD LOGIC
  // const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
  //   setLocalAnswers(prev => ({
  //     ...prev,
  //     [questionId]: optionId
  //   }));
  // }, []);
  const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
    setLocalAnswers(prev => {
      const currentAnswer = prev[questionId];
      const question = currentTestQuestions.find(q => q.id === questionId);

      console.log('question ===>', question)

      if (question?.isMultiple) {
        const selected = Array.isArray(currentAnswer) ? currentAnswer : [];
        const exists = selected.includes(optionId);

        return {
          ...prev,
          [questionId]: exists
            ? selected.filter(id => id !== optionId)
            : [...selected, optionId],
        };
      }

      return {
        ...prev,
        [questionId]: optionId
      };
    });
  }, [currentTestQuestions]);

  // Save the current step to store whenever it changes
  useEffect(() => {
    if (testResultId && currentStep >= 0) {
      saveTestPosition(testResultId, currentStep);
    }
  }, [currentStep, testResultId, saveTestPosition]);

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    try {
      setLoading(true);

      await saveAnswer(testResultId, currentQuestion.id, localAnswers[currentQuestion.id]);
      // TODO: нужно будет обновить saveAnswer() что-то типо вот так

      // await saveAnswer(
      //   testResultId,
      //   currentQuestion.id,
      //   currentQuestion.isMultiple
      //     ? (localAnswers[currentQuestion.id] as number[])
      //     : (localAnswers[currentQuestion.id] as number)
      // );

      if (currentStep === totalQuestions - 1) {
        await completeTest(testResultId);

        setCompleted(true);

        // Navigate to the result page with the test result ID
        navigate(`/results/${testResultId}`);
        return;
      }

      // Move to the next question
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Save progress to store
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

      // Save progress to store
      saveTestPosition(testResultId, prevStep);

      setCurrentQuestion(currentTestQuestions[prevStep]);
    }
  }, [currentStep, currentTestQuestions, testResultId, saveTestPosition]);

  // UI
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalQuestions - 1;
  
  // TODO: OLD LOGIC
  // const isOptionSelected = currentQuestion ? !!localAnswers[currentQuestion.id] : false;
  const isOptionSelected = currentQuestion
  ? currentQuestion.isMultiple
    ? Array.isArray(localAnswers[currentQuestion.id]) && (localAnswers[currentQuestion.id] as number[]).length > 0
    : !!localAnswers[currentQuestion.id]
  : false;

  const cursorStyle = { cursor: loading ? 'wait' : 'pointer' };

  if (!currentQuestion) {
    return <div className="test-section">Loading...</div>;
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
            <div className="questions__title">{currentQuestion?.text}</div>
            {/* TODO: OLD LOGIC */}
            {/* <div className="questions__list">
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
            </div> */}
            <div className="questions__list">
              {currentQuestion.isMultiple ? (
                // for multyply
                currentQuestion.options.map((option) => {
                  const selected = Array.isArray(localAnswers[currentQuestion.id])
                    ? (localAnswers[currentQuestion.id] as number[]).includes(option.id)
                    : false;

                  return (
                    <div
                      key={option.id}
                      className={`questions__item ${selected ? 'selected' : ''}`}
                      onClick={() => !loading && handleOptionSelect(currentQuestion.id, option.id)}
                      style={cursorStyle}
                    >
                      <div className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          id={`option-${option.id}`}
                          name={`question-${currentQuestion.id}`}
                          value={option.id.toString()}
                          checked={selected}
                          readOnly
                        />
                        <span style={cursorStyle}>{option.text}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                // for single
                currentQuestion?.options?.map((option) => (
                  <div
                    key={option.id}
                    className={`questions__item ${
                      localAnswers[currentQuestion.id] === option.id ? 'selected' : ''
                    }`}
                    onClick={() => !loading && handleOptionSelect(currentQuestion.id, option.id)}
                    style={cursorStyle}
                  >
                    <div className="radio-wrapper">
                      <input
                        type="radio"
                        id={`option-${option.id}`}
                        name={`question-${currentQuestion.id}`}
                        value={option.id.toString()}
                        checked={localAnswers[currentQuestion.id] === option.id}
                        readOnly
                      />
                      <span style={cursorStyle}>{option.text}</span>
                    </div>
                  </div>
                ))
              )}
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
          <button
              type="button"
              onClick={handleNext}
              disabled={!isOptionSelected || loading}
              className="test-section__next-btn"
          >
            {isLastStep ? 'Завершити' : 'Далі'}
            <ArrowIcon width={17} height={12} />
          </button>
        </div>
      </div>
  );
};

export default TestStepper;