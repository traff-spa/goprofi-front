import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';
import { getProfessionsForType, getTypeDetails } from '@app/helpers/professions';
import '@app/styles/test.scss';
import {formatDate} from '../helpers/dateHelpers'

const TestResult: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { fetchTestResult, currentTestResult, isLoading, error } = useTestStore();

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.AUTH);
            return;
        }

        if (id) {
            fetchTestResult(parseInt(id, 10));
        }
    }, [id, user, navigate, fetchTestResult]);


    if (isLoading) {
        return <div className="test-container">Завантаження результатів тесту...</div>;
    }

    if (error || !currentTestResult || !currentTestResult.completed_at) {
        return (
            <div className="test-container">
                <div>
                    <h2>Помилка завантаження результатів</h2>
                    <p>{error || 'Результат тесту не знайдено або тест не завершено.'}</p>
                    <button
                        onClick={() => navigate(ROUTES.MAIN)}
                        className="test-results-btn"
                        type="button"
                    >
                        Повернутися на головну
                    </button>
                </div>
            </div>
        );
    }

    // Extracting result data
    const { primary_type, result_data, test_name, completed_at } = currentTestResult;
    const primaryType = result_data?.primary_type || primary_type;
    const wingType = result_data?.wing_type;
    const formattedDate = formatDate(completed_at);

    // Get professions based on primary type ID
    const professionCategories = getProfessionsForType(primaryType?.id);

    // Get type details based on primary type and wing type
    const typeDetails = getTypeDetails(primaryType?.id, wingType?.id);

    return (
        <div className="result">
            <div className="test-result">
                <div className="test-result__inner">
                    <div className="test-result__title">
                        Вітаємо з успішним проходженням тесту {test_name} о {formattedDate} 🎉
                    </div>

                    <div className="test-result__description">
                        Ви {typeDetails.typeNumber} тип еннеаграми, {typeDetails.typeDescription}.
                    </div>

                    <div className="test-result__content">
                        <h3>Основні риси {typeDetails.typeNumber}-го типу:</h3>

                        {typeDetails.mainTraits.map((trait, index) => (
                            <React.Fragment key={index}>
                                <p>{trait.title}</p>
                                {trait.points.map((point, pointIndex) => (
                                    <p key={pointIndex}>{point}</p>
                                ))}
                                <hr />
                                {index < typeDetails.mainTraits.length - 1 && <br />}
                            </React.Fragment>
                        ))}


                        <p>{typeDetails.summary}</p>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <p>Поділитися результатом:</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="#4c4b4a" fillOpacity="0.2" />
                                        <path d="M14.5 8.5H16.5V10.5H14.5V16.5H12.5V10.5H10.5V8.5H12.5V7.5C12.5 6.97 12.7134 6.4634 13.0947 6.0822C13.476 5.70089 13.9826 5.4875 14.5125 5.4875H16.5V7.4875H14.5V8.5Z" fill="#4c4b4a" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="suitable-professions">
                <div className="suitable-professions__title">
                    Професії, які вам підійдуть виходячи з вашого психотипу
                </div>

                {professionCategories.map((category, index) => (
                    <div className="suitable-professions__item" key={index}>
                        <div className="suitable-professions__item-left">
                            <div className="suitable-professions__item-title">{category.title}</div>
                            <div className="suitable-professions__item-text">{category.description}</div>
                        </div>
                        <div className="suitable-professions__item-right">
                            <div className="suitable-professions__item-items">
                                {category.professions.map((profession, idx) => (
                                    <div className="suitable-professions__item-profession" key={idx}>
                                        {profession}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '40px' }}>
                <button
                    onClick={() => navigate(ROUTES.MAIN)}
                    className='testResultButton'
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="#4c4b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Пройти тест ще раз
                </button>
            </div>
        </div>
    );
};

export default TestResult;