import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';

import { useAuthStore } from '@/store/authStore';
import { useTestStore } from '@/store/testStore';

import { ROUTES } from '@/app/routes/paths';
import { TestResult } from '@/app/types';
import { formatDate } from '@app/helpers/dateHelpers';
import {
    validateUserId,
    hasNoTestResults,
    getTestStatusText,
    getTestProgress,
    getTestLinkText,
    getTestUrl
} from '@app/helpers/testHistoryHelpers';
import '@app/styles/history.scss';

export const TestHistory: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        userTestResults,
        fetchUserTestResults,
        isLoading
    } = useTestStore();

    useEffect(() => {
        if (!user || !user.id) {
            console.log('No user found, redirecting to auth page');
            navigate(ROUTES.AUTH);
            return;
        }

        const loadTestResults = async () => {
            try {
                // Validate and convert user ID
                const userId = validateUserId(user.id);
                await fetchUserTestResults(userId);
            } catch (error) {
                console.error('Failed to fetch test history:', error);
            }
        };

        loadTestResults();
    }, [user, navigate, fetchUserTestResults]);

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

    return (
        <div className="test-history">
            <div className="test-history__inner">
                <div className="test-history__head">
                    <div className="test-history__title">Історія тестів</div>
                </div>

                {hasNoTestResults(userTestResults) ? (
                    <div>У вас ще немає пройдених тестів.</div>
                ) : (
                    <div className="test-history__list">
                        {userTestResults.map((test: TestResult) => {
                            const statusText = getTestStatusText(test.completed_at);
                            const progress = getTestProgress(test.completed_at, test.progress);
                            const linkText = getTestLinkText(test.completed_at);
                            const testUrl = getTestUrl(test.id, test.completed_at);

                            return (
                                <div key={test.id} className="test-history__item">
                                    <div className="test-history__item-head">
                                        <div className="test-history__item-info">
                                            <div className="test-history__item-title">{test.test_name || 'Тест "Хто я?"'}</div>
                                            <div className="test-history__item-date">{formatDate(test.started_at)}</div>
                                        </div>
                                        <div className={test.completed_at ? 'test-history__item-status done' : 'test-history__item-status'}>
                                            {statusText}
                                        </div>
                                    </div>
                                    <div className="test-history__item-progress">
                                        <div className="test-history__item-progress-head">
                                            <span>Прогрес</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="test-history__item-progress-box">
                                            <span
                                                className={test.completed_at ? 'test-history__item-progress-range done' : 'test-history__item-progress-range'}
                                                style={{ width: `${progress}%` }}
                                            ></span>
                                        </div>
                                    </div>
                                    <div className="test-history__item-bottom">
                                        <Link
                                            to={testUrl}
                                            className={!test.completed_at ? 'test-history__link in-progress' : 'test-history__link'}
                                        >
                                            {linkText}
                                            {!test.completed_at && <ArrowIcon width={17} height={12} />}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};