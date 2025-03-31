import { Link } from 'react-router-dom';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';
import '@app/styles/history.scss'

interface ITest {
  id: number
  name: string
  status: string
  date: string
  progress: number
}

const mockData: ITest[] = [
  { id: 1, name: 'Тест "Хто я?"', status: 'Завершено', date: '01.01.2025', progress: 100 },
  { id: 2, name: 'Тест "Хто я?"', status: 'Завершено', date: '08.01.2025', progress: 100 },
  { id: 3, name: 'Тест "Хто я?"', status: 'У процесі', date: '12.01.2025', progress: 40 },
]

const TestHistory = () => {
  return (
    <div className="test-history">
      <div className="test-history__inner">
        <div className="test-history__head">
          <div className="test-history__title">Історія тестів</div> 
        </div>
        <div className="test-history__list">
          {mockData?.map((test: ITest) => (
            <div key={test.id} className="test-history__item">
              <div className="test-history__item-head">
                <div className="test-history__item-info">
                  <div className="test-history__item-title">{test.name}</div>
                  <div className="test-history__item-date">{test.date}</div>
                </div>
                <div className={test.progress === 100 ? 'test-history__item-status done' : 'test-history__item-status' }>
                  {test.status}
                </div>
              </div>
              <div className="test-history__item-progress">
                <div className="test-history__item-progress-head">
                  <span>Прогрес</span>
                  <span>{test?.progress || 0}%</span>
                </div>
                <div className="test-history__item-progress-box">
                  <span className={test?.progress === 100 ? 'test-history__item-progress-range done' : 'test-history__item-progress-range'} style={{ width: `${test?.progress || 0}%` }}></span>
                </div>
              </div>
              <div className="test-history__item-bottom">
                <Link 
                  to={`/test/${test.id}`} 
                  className={test?.progress !== 100 ? 'test-history__link in-progress' : 'test-history__link'}
                >
                  {test?.progress === 100 ? 'Результат теста' : 'Продовжити тест'}
                  {test?.progress !== 100 && <ArrowIcon width={17} height={12} />} 
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestHistory