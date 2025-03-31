import { useState, FC } from 'react';
import '@app/styles/test.scss'
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';

export const questions = [
  {
    id: 1,
    text: "Мені важко відкрито говорити про свої потреби та звертатися за допомогою до інших людей",
    options: [
      { value: "YES", label: "Так" },
      { value: "NO", label: "Нi" },
    ],
  },
  {
    id: 2,
    text: "Мені складно ділитися своїми емоціями з близькими людьми, навіть коли мені потрібна підтримка.",
    options: [
      { value: "YES", label: "Так" },
      { value: "NO", label: "Нi" },
    ],
  },
  {
    id: 3,
    text: "Мені важко просити про пораду, коли я не знаю, як вирішити проблему.",
    options: [
      { value: "YES", label: "Так" },
      { value: "NO", label: "Нi" },
    ],
  },
]

const Question = ({ question, selectedOption, onOptionChange }: any) => {
  return (
    <div className="questions">
      <div className="questions__title">{question.text}</div>
      <div className="questions__list">
        {question.options.map((option: any) => (
          <label key={option.value} className="questions__item">
            <input
              type="radio"
              value={option.value}
              checked={selectedOption === option.value}
              onChange={() => onOptionChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface Props {
  setCompleted: (state: boolean) => void
}

const TestStepper: FC<Props> = ({ setCompleted }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const handleOptionChange = (questionId: any, value: any) => {
    setAnswers((prev: any) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  const handleNext = () => {
    console.log('click ???')
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true)
      console.log('Тест завершен! Ваши ответы: ' + JSON.stringify(answers))
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const currentQuestion = questions[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === questions.length - 1;
  const isOptionSelected = !!answers[currentQuestion.id];

  return (
    <div className="test-section">
      <div className="test-section__body">
        <div className="test-section__title">
          Питання 1 из {questions?.length}
        </div>
        <div className="test-section__progress">
          <div
            className="test-section__progress-bar"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%`, }}
          />
        </div>
        <Question
          question={currentQuestion}
          selectedOption={answers[currentQuestion.id] || ''}
          onOptionChange={(value: any) => handleOptionChange(currentQuestion.id, value)}
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
          {isLastStep ? 'Завершить' : 'Далее'}
          <ArrowIcon width={17} height={12} />
        </button>
      </div>
    </div>
  )
}

export default TestStepper