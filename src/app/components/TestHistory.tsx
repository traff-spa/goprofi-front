import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';

import { useAuthStore } from '@/store/authStore';
import { useTestStore } from '@/store/testStore';

import { ROUTES } from '@/app/routes/paths';
import { TestResult } from '@/app/types';
import '@app/styles/history.scss';

export const TestHistory: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        userTestResults,
        fetchUserTestResults,
        isLoading,
        error
    } = useTestStore();

    const [showError, setShowError] = useState<boolean>(false);

    useEffect(() => {
        if (!user || !user.id) {
            console.log('No user found, redirecting to auth page');
            navigate(ROUTES.AUTH);
            return;
        }

        const loadTestResults = async () => {
            try {
                setShowError(false);
                // Convert user.id to number regardless of its original type
                const userId = parseInt(user.id.toString(), 10);

                if (isNaN(userId)) {
                    throw new Error(`Invalid user ID: ${user.id}`);
                }

                await fetchUserTestResults(userId);
            } catch (error) {
                console.error('Failed to fetch test history:', error);
                setShowError(true);
            }
        };

        loadTestResults();
    }, [user, navigate, fetchUserTestResults]);

    // Format date to DD.MM.YYYY
    const formatDate = (dateString: Date | string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    };

    if (isLoading) {
        return (
            <div className="test-history">
                <div className="test-history__inner">
                    <div className="test-history__head">
                        <div className="test-history__title">Історія тестів</div>
                    </div>
                    <div>Завантаження...</div>
                </div>
            </div>
        );
    }

    if (error || showError) {
        return (
            <div className="test-history">
                <div className="test-history__inner">
                    <div className="test-history__head">
                        <div className="test-history__title">Історія тестів</div>
                    </div>
                    <div>Помилка завантаження історії тестів: {error || 'Невідома помилка'}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="test-history__reload-btn"
                        style={{ marginTop: '20px', padding: '8px 16px' }}
                    >
                        Спробувати знову
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="test-history">
            <div className="test-history__inner">
                <div className="test-history__head">
                    <div className="test-history__title">Історія тестів</div>
                </div>

                {!userTestResults || userTestResults.length === 0 ? (
                    <div>У вас ще немає пройдених тестів.</div>
                ) : (
                    <div className="test-history__list">
                        {userTestResults.map((test: TestResult) => (
                            <div key={test.id} className="test-history__item">
                                <div className="test-history__item-head">
                                    <div className="test-history__item-info">
                                        <div className="test-history__item-title">{test.test_name || 'Тест "Хто я?"'}</div>
                                        <div className="test-history__item-date">{formatDate(test.started_at)}</div>
                                    </div>
                                    <div className={test.completed_at ? 'test-history__item-status done' : 'test-history__item-status'}>
                                        {test.completed_at ? 'Завершено' : 'У процесі'}
                                    </div>
                                </div>
                                <div className="test-history__item-progress">
                                    <div className="test-history__item-progress-head">
                                        <span>Прогрес</span>
                                        <span>{test.completed_at ? 100 : (test.progress || 0)}%</span>
                                    </div>
                                    <div className="test-history__item-progress-box">
                                        <span
                                            className={test.completed_at ? 'test-history__item-progress-range done' : 'test-history__item-progress-range'}
                                            style={{ width: `${test.completed_at ? 100 : (test.progress || 0)}%` }}
                                        ></span>
                                    </div>
                                </div>
                                <div className="test-history__item-bottom">
                                    <Link
                                        to={test.completed_at ? `/results/${test.id}` : `/test/${test.id}`}
                                        className={!test.completed_at ? 'test-history__link in-progress' : 'test-history__link'}
                                    >
                                        {test.completed_at ? 'Результат тесту' : 'Продовжити тест'}
                                        {!test.completed_at && <ArrowIcon width={17} height={12} />}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};