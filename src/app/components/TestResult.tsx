import React, { useEffect } from 'react';
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

import { useTestStore } from '@/store/testStore';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/app/routes/paths';
import { getProfessionsForType, getTypeDetails } from '@app/helpers/professions';

import LampIcon from '@/assets/icons/lamp.svg?react';
import '@app/styles/test.scss';

import { formatDate } from '../helpers/dateHelpers'
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
  const { primary_type, result_data, test_name, completed_at } = currentTestResult;
  const isPaid = currentTestResult?.is_paid
  const primaryType = result_data?.primary_type || primary_type;
  const wingType = result_data?.wing_type;
  const formattedDate = formatDate(completed_at);

  // Get professions based on primary type ID
  const professionCategories = getProfessionsForType(isPaid ? primaryType?.id : 999);

  // Get type details based on primary type and wing type
  const typeDetails = getTypeDetails(primaryType?.id, wingType?.id);
  const contentData = isPaid ? typeDetails?.mainTraits : typeDetails?.mainTraits?.slice(0, 3)

  return (
    <>
      <div className="result">
        <div className="test-result">
          <div className="test-result__inner">
            <div className="test-result__title">
              Вітаємо з успішним проходженням тесту {test_name} о {formattedDate} 🎉
            </div>

            <div className="test-result__description">
              {primaryType?.id !== 1 && <><span>Ви {typeDetails.typeNumber} тип еннеаграми</span>,</>} {typeDetails.typeDescription}
            </div>

            <div className={!isPaid ? 'test-result__content hidden' : 'test-result__content'}>
              {primaryType?.id !== 1 && <h3>Основні риси {typeDetails.typeNumber}-го типу:</h3>}

              {contentData?.map((trait, index) => (
                <React.Fragment key={index}>
                  <h3>{index + 1}. {trait?.title}</h3>
                  {trait?.points?.map((point, pointIndex) => (
                    <p key={pointIndex}>{point}</p>
                  ))}
                  <hr />
                </React.Fragment>
              ))}
              
              {(primaryType?.id === 1 && isPaid) && <div className="quote-bubble">{typeDetails.bottomDescription}</div>}

              {!isPaid && (
                <PurchaseModal testResultId={id} />
              )}
            </div>
          </div>
        </div>
        
        {/* TODO: logic */}
        {primaryType?.id === 1 && (
          <div className="test-result">
            <div className="test-result__inner">
              <div className="test-result__title">
                Твоя кар'єрна Road-map
              </div>
              <div className={!isPaid ? 'test-result__content hidden' : 'test-result__content'}>
                <h3>Тебе мотивує в роботі:</h3>
                <div className="motivation-block">
                  <div className="motivation-block__left">
                    <ol>
                      <li>прагнення до досконалості;</li>
                      <li>високі стандарти;</li>
                      <li>відповідальність перед собою та іншими;</li>
                      <li>бажання бути «правильним» фахівцем, якому можна довіряти.</li>
                    </ol>
                  </div>
                  <div className="motivation-block__right">

                  </div>
                </div>

                <h3>Підсвідомий мотив:</h3>
                <div className="test-result__description">Бути бездоганним, щоб заслужити повагу і уникнути критики — перш за все внутрішньої.</div>

                <h3>Тобі важливо в роботі, (спирайся на ці при виборі команди):</h3>
                <ul className="ckeckbox-list">
                  <li>робити «правильну» справу;</li>
                  <li>працювати за цінностями;</li>
                  <li>змінювати щось на краще;</li>
                  <li>відчувати, що ваша робота має сенс, користь і моральну вагу.</li>
                </ul>
                 <hr />

                <h3>Твій основний страх:</h3>
                <p>Зробити помилку або не відповідати своїм внутрішнім стандартам. Основна мотивація — бути хорошими, правильними та виправляти недоліки як у собі, так і в оточуючому світі.</p>
                <p>
                  <span style={{ color: '#a41010', fontWeight: '700' }}>
                  Страхи - це нормально, головне розуміти чи не керують вони тобою, для цього треба їх дуже добре знати.
                  </span>
                </p>
                <hr />

                <div className="content-subtitle">Твої сильні професійні сторони  твої слабкі професійні сторони</div>
                <div className="list-columns">
                  <div className="list-columns__item">
                    <div className="list-columns__item-subtitle">Сильні сторони:</div>
                    <ul>
                      <li>висока дисципліна і організованість;</li>
                      <li>вміння бачити деталі, які інші можуть пропустити;</li>
                      <li>відповідальність і відданість справі;</li>
                      <li>моральна стійкість і принциповість;</li>
                      <li>сильне прагнення до вдосконалення.</li>
                    </ul>
                  </div>
                  <div className="list-columns__item">
                    <div className="list-columns__item-subtitle">Професійні слабкості:</div>
                    <ul>
                      <li>перфекціонізм може призводити до відкладання виконання завдань (прокрастинації);</li>
                      <li>схильність до критичності — як до себе, так і до інших;</li>
                      <li>високий рівень внутрішнього стресу через потребу в ідеальності.</li>
                    </ul>
                  </div>
                </div>
                 <hr />

                <div className="content-subtitle">
                  <LampIcon width={40} height={40} />
                  Рекомендації для побудови успішного кар'єрного розвитку:
                </div>
                <ol className="counter-list">
                  <li>Навчіться <b>визначати пріоритети:</b> не кожна задача потребує однакової уваги та ідеального виконання. </li>
                  <li>Практикуйте <b>правило 80/20:</b> визначайте найважливіші завдання, які дадуть максимальний результат.</li>
                  <li><b>Відпустіть контроль:</b> не бійтеся делегувати. Навчання довіряти іншим дозволить вам зосередитися на більш значущих завданнях і уникнути емоційного вигорання.</li>
                  <li><b>Розвивайте емоційну гнучкість:</b> робота з емоціями допоможе знизити рівень критичності до себе та інших. Практикуйте вдячність і фокусуйтесь на досягненнях, а не на недоліках.</li>
                  <li><b>Прийміть ідею "достатньо добре":</b> ваша робота не завжди повинна бути ідеальною. Часто "достатньо добре" — це саме те, що потрібно для прогресу та результатів.</li>
                  <li><b>Розширюйте уявлення про успіх:</b> успіх — це не тільки результат, але й шлях до нього. Додайте більше гнучкості та задоволення в процес своєї роботи.</li>
                </ol>

                {!isPaid && (
                  <PurchaseModal testResultId={id} />
                )}
              </div>
            </div>
          </div>
        )}
        

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