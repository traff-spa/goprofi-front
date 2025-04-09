import { useState, FC } from 'react';
import '@app/styles/test.scss'
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import { useTestStore } from '@/store/testStore.ts';
import type { Question } from '@app/types';

interface Props {
  testResultId: number;
  setCompleted: (state: boolean) => void
}

const Question = ({ question, selectedOptionId, onOptionChange }: {
  question: Question;
  selectedOptionId: number | null;
  onOptionChange: (optionId: number) => void;
}) => {
  return (
      <div className="questions">
        <div className="questions__title">{question.text}</div>
        <div className="questions__list">
          {question.options.map((option) => (
              <label key={option.id} className="questions__item">
                <input
                    type="radio"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => onOptionChange(option.id)}
                />
                <span>{option.text}</span>
              </label>
          ))}
        </div>
      </div>
  );
}

const TestStepper: FC<Props> = ({ testResultId, setCompleted }) => {
  const { saveAnswers, currentTestQuestions } = useTestStore();
  // const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  // const [isLoading, setIsLoading] = useState(false);

  console.log('Current Test Questions:', currentTestQuestions);

  const handleOptionChange = async (questionId: number, optionId: number) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: optionId
    };
    setAnswers(updatedAnswers);

    // Immediately save the answer
    try {
      await saveAnswers(testResultId, [{
        question_id: questionId,
        selected_option_id: optionId,
        response_value: optionId, // Assuming the option value corresponds to the response value
      }]);
    } catch (error) {
      console.error('Failed to save answer', error);
    }
  }

  const handleNext = () => {
    if (currentStep < currentTestQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  if (currentTestQuestions.length === 0) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = currentTestQuestions[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentTestQuestions.length - 1;
  const isOptionSelected = !!answers[currentQuestion.id];

  return (
      <div className="test-section">
        <div className="test-section__body">
          <div className="test-section__title">
            Питання {currentStep + 1} з {currentTestQuestions.length}
          </div>
          <div className="test-section__progress">
            <div
                className="test-section__progress-bar"
                style={{ width: `${((currentStep + 1) / currentTestQuestions.length) * 100}%` }}
            />
          </div>
          <Question
              question={currentQuestion}
              selectedOptionId={answers[currentQuestion.id] || null}
              onOptionChange={(optionId) => handleOptionChange(currentQuestion.id, optionId)}
          />
        </div>
        <div className="test-section__footer">
          <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep}
              className="test-section__back-btn"
          >
            Назад
          </button>
          <button
              type="button"
              onClick={handleNext}
              disabled={!isOptionSelected}
              className="test-section__next-btn"
          >
            {isLastStep ? 'Завершити' : 'Далі'}
            <ArrowIcon width={17} height={12} />
          </button>
        </div>
      </div>
  )
}

export default TestStepper;