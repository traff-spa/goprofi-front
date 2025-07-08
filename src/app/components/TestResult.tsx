import React, { useEffect } from 'react';
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';
import { getProfessionsForType, getTypeDetails, getRoadMapDetails } from '@app/helpers/professions';

import LampIcon from '@/assets/icons/lamp.svg?react';
import '@app/styles/test.scss';

import PurchaseModal from './Modals/PurchaseModal'

const TestResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchTestResult, currentTestResult, isLoading, error } = useTestStore();

  const setTestTitle = useTestStore(state => state.setTestTitle);
  const setTestHistoryPage = useTestStore(state => state.setIsTestResultPage);

  useEffect(() => {
      setTestHistoryPage(true);
      setTestTitle('"Хто я"');

      // Clean up when a component unmounts
      return () => {
          setTestHistoryPage(false);
          setTestTitle('');
      }
  }, []);

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
      return (
          <div className="test-container loader">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          </div>
      )
  }

  if (error || !currentTestResult || !currentTestResult.completed_at || !id) {
    return (
      <div className="test-result">
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
      </div>
    );
  }

  // Extracting result data
  const { primary_type, result_data, test_name } = currentTestResult;
  const isPaid = currentTestResult?.is_paid
  const primaryType = result_data?.primary_type || primary_type;
  const wingType = result_data?.wing_type;

  // Get professions based on primary type ID
  const professionCategories = getProfessionsForType(isPaid ? primaryType?.id : 999);

  // Get type details based on primary type and wing type
  const typeDetails = getTypeDetails(primaryType?.id, wingType?.id);
  const contentData = isPaid ? typeDetails?.mainTraits : typeDetails?.mainTraits?.slice(0, 3)

  // Get type Road-map based on primary type and wing type
  const roadMap = getRoadMapDetails(primaryType?.id, wingType?.id)
  const roadMapData = isPaid 
    ? roadMap
    : {
      motivation: roadMap.motivation,
      subconsciousMotive: roadMap.subconsciousMotive,
      importantInWork: roadMap.importantInWork
    }

  return (
    <>
      <div className="result">
        <div className="test-result">
          <div className="test-result__inner">
            <div className="test-result__title">
              Вітаємо з успішним проходженням тесту {test_name} 🎉
            </div>

            <div className="test-result__name">{typeDetails?.typeName}</div>

            <div className="test-result__description">
              {typeDetails.typeDescription}
            </div>

            <div className={!isPaid ? 'test-result__content hidden' : 'test-result__content'}>
              {contentData?.map((trait, index) => (
                <React.Fragment key={index}>
                  <h3>{index + 1}. {trait?.title}</h3>
                  {trait?.points?.map((point, pointIndex) => (
                    <p key={pointIndex}>{point}</p>
                  ))}
                  <hr />
                </React.Fragment>
              ))}
              
              {(isPaid && typeDetails.bottomDescription) && (
                <div className="quote-bubble">{typeDetails.bottomDescription}</div>
              )}

              {!isPaid && (
                <PurchaseModal testResultId={id} />
              )}
            </div>
          </div>
        </div>
        
        <div className="test-result">
          <div className="test-result__inner">
            <div className="test-result__title">Твій карєрний план</div>

            <div className={!isPaid ? 'test-result__content hidden' : 'test-result__content'}>
              {roadMapData.motivation && (
                <>
                  <h3>{roadMapData.motivation.title}</h3>
                  <div className="motivation-block">
                    <div className="motivation-block__left">
                      <ol className="counter-list">
                        {roadMapData?.motivation?.points?.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="motivation-block__right"></div>
                  </div>
                </>
              )}

              {roadMapData.subconsciousMotive && (
                <>
                  <h3>{roadMapData.subconsciousMotive.title}</h3>
                  <div className="test-result__description">{roadMapData.subconsciousMotive.text}</div>
                </>
              )}

              {roadMapData.importantInWork && (
                <>
                  <h3>{roadMapData.importantInWork.title}</h3>
                  <ul className="ckeckbox-list">
                    {roadMapData?.importantInWork?.points?.map((point: string, index: number) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                  <hr />
                </>
              )}

              {roadMapData.mainFear && (
                <>
                  <h3>{roadMapData.mainFear.title}</h3>
                  {roadMapData.mainFear.text.split('\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  {roadMapData.mainFear.note && (
                    <p>
                      <span style={{
                        fontFamily: 'sans-serif',
                        fontStyle: 'italic',
                        color: '#000',
                        fontWeight: '700'
                      }}>
                        {roadMapData.mainFear.note}
                      </span>
                    </p>
                  )}
                  <hr />
                </>
              )}

              {roadMapData.strengthsAndWeaknesses && (
                <>
                  <div className="content-subtitle">{roadMapData.strengthsAndWeaknesses.title}</div>
                  <div className="list-columns">
                    <div className="list-columns__item">
                      <div className="list-columns__item-subtitle">{roadMapData.strengthsAndWeaknesses.strengths.title}</div>
                      <ul>
                        {roadMapData?.strengthsAndWeaknesses?.strengths?.points?.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="list-columns__item">
                      <div className="list-columns__item-subtitle">{roadMapData.strengthsAndWeaknesses.weaknesses.title}</div>
                      <ul>
                        {roadMapData?.strengthsAndWeaknesses?.weaknesses?.points?.map((point: string, index: number) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <hr />
                </>
              )}

              {roadMapData.recommendations && (
                <>
                  <div className="content-subtitle">
                    <LampIcon width={40} height={40} />
                    {roadMapData.recommendations.title}
                  </div>
                  <ol className="counter-list">
                    {roadMapData.recommendations.points.map((point: string, index: number) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                    ))}
                  </ol>
                </>
              )}

              {!isPaid && (
                <PurchaseModal testResultId={id} />
              )}
            </div>
          </div>
        </div>

        <div className="suitable-professions">
          <div className="suitable-professions__title">
            Професії, які вам підійдуть виходячи з вашого психотипу
          </div>
          
          <div className={!isPaid ? 'suitable-professions__list hidden' : 'suitable-professions__list'}>
            {professionCategories?.map((category, index) => (
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
          
          {!isPaid && (
            <PurchaseModal testResultId={id} />
          )}

        </div>
      </div>
    </>
  );
};

export default TestResult;