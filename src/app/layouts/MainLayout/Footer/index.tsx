import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/routes/paths';

import '@/app/styles/footer.scss';

export const Footer = () => (
    <footer className="footer">
        <div className="footer__inner">
            <Link to={ROUTES.POLICY}>
                Політика конфіденційності
            </Link>
            <Link to={ROUTES.OFFER}>
                Договір оферти
            </Link>
            <Link to={ROUTES.TERMS}>
                Умови користування
            </Link>
        </div>
    </footer>
);
