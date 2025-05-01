import { Link } from 'react-router-dom';
import { ROUTES } from '@app/routes/paths';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Сторінка не знайдена</h1>
      <p className="mb-6">На жаль, такої сторінки не існує.</p>
      <Link 
        to={ROUTES.MAIN} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Повернутись на головну
      </Link>
    </div>
  )
}

export default NotFoundPage