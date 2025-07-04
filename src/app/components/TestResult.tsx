import React, { useEffect, useState } from 'react';
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';
import { getProfessionsForType, getTypeDetails } from '@app/helpers/professions';

import LockIcon from '@/assets/icons/lock.svg?react';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';

import '@app/styles/test.scss';

import { formatDate } from '../helpers/dateHelpers'
import PurchaseModal from './Modals/PurchaseModal'

const TestResult: React.FC = () => {
  const [purchaseModalVisible, setPurchaseModalVisible] = useState<boolean>(false)

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchTestResult, currentTestResult, isLoading, error } = useTestStore();

  const setTestTitle = useTestStore(state => state.setTestTitle);
  const setTestHistoryPage = useTestStore(state => state.setIsTestResultPage);

  useEffect(() => {
      setTestHistoryPage(true);
      setTestTitle('Тест "Хто я"');

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
  const { primary_type, result_data, test_name, completed_at } = currentTestResult;
  const isPaid = currentTestResult?.is_paid
  const primaryType = result_data?.primary_type || primary_type;
  const wingType = result_data?.wing_type;
  const formattedDate = formatDate(completed_at);

  // Get professions based on primary type ID
  const professionCategories = getProfessionsForType(isPaid ? primaryType?.id : 999);

  // Get type details based on primary type and wing type
  const typeDetails = getTypeDetails(primaryType?.id, wingType?.id);
  const contentData = isPaid ? typeDetails?.mainTraits : typeDetails?.mainTraits?.slice(0, 2)

  return (
    <>
      <div className="result">
        <div className="test-result">
          <div className="test-result__inner">
            <div className="test-result__title">
              Вітаємо з успішним проходженням тесту {test_name} о {formattedDate} 🎉
            </div>

            <div className="test-result__description">
              <span>Ви {typeDetails.typeNumber} тип еннеаграми</span>, {typeDetails.typeDescription}.
            </div>

            <div className={!isPaid ? 'test-result__content hidden' : 'test-result__content'}>
              <h3>Основні риси {typeDetails.typeNumber}-го типу:</h3>

              {contentData?.map((trait, index) => (
                <React.Fragment key={index}>
                  <p>{trait?.title}</p>
                  {trait?.points?.map((point, pointIndex) => (
                    <p key={pointIndex}>{point}</p>
                  ))}
                  <hr />
                  {index < typeDetails.mainTraits.length - 1 && <br />}
                </React.Fragment>
              ))}

              {!isPaid && (
                <div
                  onClick={() => setPurchaseModalVisible(true)}
                  className="test-result__unlock-button"
                >
                  <LockIcon width={18} height={18} />
                  Розблокувати
                  <span><ArrowIcon width={17} height={12} /></span>
                </div>
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
        </div>
      </div>
      <PurchaseModal
        testResultId={id}
        purchaseModalVisible={purchaseModalVisible}
        setPurchaseModalVisible={setPurchaseModalVisible} />
    </>
  );
};

export default TestResult;