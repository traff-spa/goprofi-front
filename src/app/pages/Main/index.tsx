import { Link } from 'react-router-dom';
import { ROUTES } from '@app/routes/paths';
import '@app/styles/home.scss'
import { useUserStore } from '@/store';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';

const Main = () => {
  const { user } = useUserStore()
  
  return (
    <div className="main-section">
      <div className="main-section__inner">
        <div className="main-section__left">
          <div className="main-section__title">Тест "Хто я?"</div>
          <div className="main-section__text">Дізнайтеся свій психотип та визначте сильні сторони, які допоможуть вам у професійному розвитку.</div>
          <Link 
            to={user?.id ? ROUTES.TEST_HISTORY : ROUTES.AUTH} 
            className="main-section__button">
            Пройти тест
            <span><ArrowIcon width={17} height={12} /></span>
          </Link>
        </div>
        <div className="main-section__right">
          <img src="/images/main-section-img.png" width="704" height="677" alt="image" />
        </div>
      </div>
    </div>
  )
}

export default Main