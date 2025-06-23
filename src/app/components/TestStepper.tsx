import React, {FC, useEffect} from 'react';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import {useNavigate} from 'react-router-dom';

import '@app/styles/test.scss';
import {Props} from '@/app/types';

import {useTestStore} from '@/store/testStore';
import {useTestData} from "@app/hooks/useTestData.ts";
import {useTestNavigation} from "@app/hooks/useTestNavigation.ts";
import {useTestAnswers} from "@app/hooks/useTestAnswers.ts";
import {useTestActions} from "@app/hooks/useTestActions.ts";

const TestStepper: FC<Props> = ({testResultId, setCompleted, initialAnswers = {}}) => {
    const navigate = useNavigate();

    const {setIsTestPage, setTestTitle, saveTestPosition} = useTestStore();

    const {questions, isLoading: isLoadingData, error} = useTestData(testResultId);

    const {
        currentStep,
        isFirstStep,
        isLastStep,
        progressPercentage,
        goNext,
        goBack
    } = useTestNavigation({
        testResultId,
        totalQuestions: questions.length
    });

    const {
        answers,
        selectOption,
        isQuestionAnswered
    } = useTestAnswers({
        initialAnswers,
        questions
    });

    const {
        isSubmitting,
        submitAnswer,
        finishTest
    } = useTestActions({
        testResultId,
        onComplete: () => {
            setCompleted(true);
            navigate(`/results/${testResultId}`);
        }
    });

    const currentQuestion = questions[currentStep] || null;
    const totalQuestions = questions.length;
    const isLoading = isLoadingData || isSubmitting;
    const isOptionSelected = currentQuestion ? isQuestionAnswered(currentQuestion.id) : false;

    const handleNext = async () => {
        if (!currentQuestion || !isOptionSelected) return;

        try {
            const answer = answers[currentQuestion.id];
            await submitAnswer(currentQuestion, answer);
            const result = saveTestPosition(testResultId, currentQuestion.id);
            console.log('storeResponse:', result); // an obj of mapped items: { "1":52, "2":52}

            if (isLastStep) {
                const questions = await finishTest();
                if (Array.isArray(questions)) {
                    // setQuestions(questions);
                }
            } else {
                goNext();
            }
        } catch (error) {
            console.error('Error processing next question:', error);
        }
    };

    const handleBack = () => {
        goBack();
    };

    const handleOptionSelect = (questionId: number, optionId: number) => {
        selectOption(questionId, optionId);
    };

    useEffect(() => {
        setIsTestPage(true);
        setTestTitle('Тест "Хто я"');

        return () => {
            setIsTestPage(false);
            setTestTitle('');
        };
    }, []);

    const cursorStyle = {cursor: isLoading ? 'wait' : 'pointer'};

    if (error) {
        return (
            <div className="test-section">
                <div className="test-section__body">
                    <h2>Помилка завантаження тесту</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/main')}
                        className="test-results-btn"
                        type="button"
                    >
                        Повернутися на головну
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion && isLoadingData) {
        return <div className="test-section">Завантаження тесту...</div>;
    }

    // if (!currentQuestion) {
    //     return <div className="test-section">Питання не знайдено</div>;
    // }

    return (
        <div className="test-section">
            <div className="test-section__body">
                <div className="test-section__title">
                    Питання {currentStep + 1} з {totalQuestions}
                </div>
                <div className="test-section__progress">
                    <div
                        className="test-section__progress-bar"
                        style={{width: `${progressPercentage}%`}}
                    />
                </div>

                <div className="questions">
                    <div className="questions__title">{currentQuestion.text}</div>
                    <div className="questions__list">
                        {currentQuestion.isMultiple ? (
                            <MultipleChoiceOptions
                                question={currentQuestion}
                                selectedAnswers={answers[currentQuestion.id] as number[] || []}
                                onSelect={handleOptionSelect}
                                disabled={isLoading}
                                cursorStyle={cursorStyle}
                            />
                        ) : (
                            <SingleChoiceOptions
                                question={currentQuestion}
                                selectedAnswer={answers[currentQuestion.id] as number}
                                onSelect={handleOptionSelect}
                                disabled={isLoading}
                                cursorStyle={cursorStyle}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="test-section__footer">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={isFirstStep || isLoading}
                    className="test-section__back-btn"
                >
                    Назад
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isOptionSelected || isLoading}
                    className="test-section__next-btn"
                >
                    {isLastStep ? 'Завершити' : 'Далі'}
                    <ArrowIcon width={17} height={12}/>
                </button>
            </div>
        </div>
    );
};

const MultipleChoiceOptions: FC<{
    question: any;
    selectedAnswers: number[];
    onSelect: (questionId: number, optionId: number) => void;
    disabled: boolean;
    cursorStyle: React.CSSProperties;
}> = ({question, selectedAnswers, onSelect, disabled, cursorStyle}) => (
    <>
        {question.options.map((option: any) => {
            const isSelected = selectedAnswers.includes(option.id);
            return (
                <div
                    key={option.id}
                    className={`questions__item ${isSelected ? 'selected' : ''}`}
                    onClick={() => !disabled && onSelect(question.id, option.id)}
                    style={cursorStyle}
                >
                    <div className="checkbox-wrapper">
                        <input
                            type="checkbox"
                            id={`option-${option.id}`}
                            name={`question-${question.id}`}
                            value={option.id.toString()}
                            checked={isSelected}
                            readOnly
                        />
                        <span style={cursorStyle}>{option.text}</span>
                    </div>
                </div>
            );
        })}
    </>
);

const SingleChoiceOptions: FC<{
    question: any;
    selectedAnswer: number;
    onSelect: (questionId: number, optionId: number) => void;
    disabled: boolean;
    cursorStyle: React.CSSProperties;
}> = ({question, selectedAnswer, onSelect, disabled, cursorStyle}) => (
    <>
        {question.options?.map((option: any) => (
            <div
                key={option.id}
                className={`questions__item ${
                    selectedAnswer === option.id ? 'selected' : ''
                }`}
                onClick={() => !disabled && onSelect(question.id, option.id)}
                style={cursorStyle}
            >
                <div className="radio-wrapper">
                    <input
                        type="radio"
                        id={`option-${option.id}`}
                        name={`question-${question.id}`}
                        value={option.id.toString()}
                        checked={selectedAnswer === option.id}
                        readOnly
                    />
                    <span style={cursorStyle}>{option.text}</span>
                </div>
            </div>
        ))}
    </>
);

export default TestStepper;