import {useState, useEffect, useCallback} from 'react';

import {useTestStore} from '@/store/testStore';
import {calculateProgressPercentage} from "@app/helpers/testHelpers.ts";
import {UseTestNavigationProps, UseTestNavigationReturn} from "@app/types";

export const useTestNavigation = ({testResultId, totalQuestions}: UseTestNavigationProps): UseTestNavigationReturn => {
    const {saveTestPosition, getTestPosition, isTestPage} = useTestStore();

    const [currentStep, setCurrentStep] = useState(() => {
        const testPosition = testResultId ? getTestPosition(testResultId) : 0; // fallback to 1st position
        return testPosition;
    });

    useEffect(() => {
        if (testResultId && currentStep >= 0) {
            saveTestPosition(testResultId, currentStep);
        }
    }, [currentStep, testResultId, isTestPage]);


    const goNext = useCallback(() => {
        if (currentStep < totalQuestions - 1) {
            setCurrentStep(prev => prev + 1);
        }
        saveTestPosition(testResultId, currentStep);
    }, [currentStep, totalQuestions]);

    const goBack = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
        saveTestPosition(testResultId, currentStep);
    }, [currentStep]);

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalQuestions - 1;
    const progressPercentage = calculateProgressPercentage(currentStep, totalQuestions)

    return {
        currentStep,
        isFirstStep,
        isLastStep,
        progressPercentage,
        goNext,
        goBack,
    };
};