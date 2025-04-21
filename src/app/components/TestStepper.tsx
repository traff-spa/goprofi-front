import React, { useState, FC, useEffect, useCallback, useRef } from 'react';
import '@app/styles/test.scss';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import { useTestStore } from '@/store/testStore';

interface Props {
  testResultId: number;
  setCompleted: (state: boolean) => void;
  initialAnswers?: {[key: number]: number};
}

const TestStepper: FC<Props> = ({ testResultId, setCompleted, initialAnswers = {} }) => {
  const { saveAnswers, currentTestQuestions, fetchTestResult } = useTestStore();

  // Store answers locally
  const [localAnswers, setLocalAnswers] = useState<{[key: number]: number}>(initialAnswers);
  const [currentStep, setCurrentStep] = useState(0);
  const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState(Object.keys(initialAnswers).length);
  const [loading, setLoading] = useState(false);

  // Use refs to track current state for use in callbacks
  const stepRef = useRef(currentStep);
  const questionsRef = useRef(currentTestQuestions);
  const localAnswersRef = useRef(localAnswers);

  // Update refs when values change
  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    questionsRef.current = currentTestQuestions;
  }, [currentTestQuestions]);

  useEffect(() => {
    localAnswersRef.current = localAnswers;
  }, [localAnswers]);

  // Find the first unanswered question on initial load only
  useEffect(() => {
    if (currentTestQuestions.length > 0 && Object.keys(initialAnswers).length > 0) {
      let foundUnanswered = false;

      for (let i = 0; i < currentTestQuestions.length; i++) {
        const question = currentTestQuestions[i];
        if (!initialAnswers[question.id]) {
          setCurrentStep(i);
          foundUnanswered = true;
          break;
        }
      }

      // If all questions are answered, position at the last question
      if (!foundUnanswered) {
        setCurrentStep(currentTestQuestions.length - 1);
      }
    }
  }, [currentTestQuestions.length, initialAnswers]); // Include initialAnswers in dependency array

  // Sync progress with answer count when needed
  useEffect(() => {
    const totalAnswered = Object.keys(localAnswers).length;
    if (totalAnswered !== answeredQuestionsCount) {
      setAnsweredQuestionsCount(totalAnswered);
    }
  }, [localAnswers, answeredQuestionsCount]);

  // Option selection handler
  const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
    if (loading) return;

    setLocalAnswers(prev => {
      const updated = { ...prev, [questionId]: optionId };
      // Save to localStorage in a single operation
      localStorage.setItem(`test_${testResultId}_answers`, JSON.stringify(updated));
      return updated;
    });

    // Track number of answered questions more efficiently
    const wasAlreadyAnswered = initialAnswers[questionId] !== undefined ||
        Object.prototype.hasOwnProperty.call(localAnswersRef.current, questionId);

    if (!wasAlreadyAnswered) {
      setAnsweredQuestionsCount(prev => prev + 1);
    }
  }, [loading, initialAnswers, testResultId]);

  const handleNext = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      // Use ref values to avoid closure issues
      const currentStepValue = stepRef.current;
      const questions = questionsRef.current;
      const answers = localAnswersRef.current;

      if (!questions.length) {
        setLoading(false);
        return;
      }

      const currentQuestion = questions[currentStepValue];
      if (!currentQuestion) {
        setLoading(false);
        return;
      }

      const selectedOptionId = answers[currentQuestion.id];
      if (!selectedOptionId) {
        setLoading(false);
        return;
      }

      // Prepare the answer to save
      const answersToSave = [{
        question_id: currentQuestion.id,
        selected_option_id: selectedOptionId
      }];

      // Check if this is the last question
      const isLastQuestion = currentStepValue >= questions.length - 1;

      // First save the answer
      const saveResponse = await saveAnswers(testResultId, answersToSave);

      if (!saveResponse) {
        throw new Error('Failed to save answer');
      }

      // Update test result to ensure store is synced
      await fetchTestResult(testResultId);

      // Important: Only update after server operations are complete
      if (!isLastQuestion) {
        // Move to the next question
        setCurrentStep(prev => prev + 1);
      } else {
        // We've reached the end
        setCompleted(true);
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      alert('Failed to save your answer. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [saveAnswers, fetchTestResult, testResultId, setCompleted, loading]);

  // Handle back button
  const handleBack = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (stepRef.current > 0 && !loading) {
      setCurrentStep(prev => prev - 1);
    }
  }, [loading]);

  // Loading state
  if (currentTestQuestions.length === 0) {
    return <div>Loading questions...</div>;
  }

  // Get current question
  const currentQuestion = currentTestQuestions[currentStep];
  if (!currentQuestion) {
    return <div>No questions available</div>;
  }

  // Calculate button states and progress
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentTestQuestions.length - 1;
  const isOptionSelected = !!localAnswers[currentQuestion.id];
  const progressPercentage = Math.round((answeredQuestionsCount / currentTestQuestions.length) * 100);

  return (
      <div className="test-section">
        <div className="test-section__body">
          <div className="test-section__title">
            Питання {currentStep + 1} з {currentTestQuestions.length}
          </div>
          <div className="test-section__progress">
            <div
                className="test-section__progress-bar"
                style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Question and options */}
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
                      style={{ cursor: loading ? 'wait' : 'pointer' }}
                  >
                    <div className="radio-wrapper" style={{ display: 'block', width: '100%' }}>
                      <input
                          type="radio"
                          id={`option-${option.id}`}
                          name={`question-${currentQuestion.id}`}
                          value={option.id.toString()}
                          checked={localAnswers[currentQuestion.id] === option.id}
                          onChange={() => {}} // Required by React but we handle via onClick
                          style={{ position: 'absolute', opacity: 0 }}
                      />
                      <span
                          className={localAnswers[currentQuestion.id] === option.id ? 'selected' : ''}
                          style={{ cursor: loading ? 'wait' : 'pointer' }}
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