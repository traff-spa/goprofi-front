import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/routes/paths';
import '@app/styles/home.scss';
import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import React from "react";

const Main = () => {
  const { user } = useAuthStore();
  const { startTest } = useTestStore();
  const navigate = useNavigate();

  const handleStartTest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user?.id) {
      navigate(ROUTES.AUTH);
      return;
    }

    try {
      // Convert user.id to number regardless of its original type
      const userId = parseInt(user.id.toString(), 10);

      if (isNaN(userId)) {
        throw new Error(`Invalid user ID: ${user.id}`);
      }

      console.log('Starting test for user:', user.id, 'converted to:', userId);

      // Default test ID
      const testId = 1;

      // Start the test
      const testResult = await startTest(userId, testId);

      if (testResult) {
        console.log('Test started successfully:', testResult);
        navigate(`/test/${testResult.id}`);
      } else {
        console.error('Failed to start test: No test result returned');
        alert('Unable to start the test. Please try again later.');
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Unable to start the test. Please try again later.');
    }
  };

  return (
      <div className="main-section">
        <div className="main-section__inner">
          <div className="main-section__left">
            <div className="main-section__title">Тест "Хто я?"</div>
            <div className="main-section__text">
              Дізнайтеся свій психотип та визначте сильні сторони, які допоможуть вам у професійному розвитку.
            </div>
            <button
                onClick={handleStartTest}
                className="main-section__button"
                type="button"
            >
              Пройти тест
              <span><ArrowIcon width={17} height={12} /></span>
            </button>
          </div>
          <div className="main-section__right">
            <img src="/images/main-section-img.png" width="704" height="677" alt="image" />
          </div>
        </div>
      </div>
  );
};

export default Main;