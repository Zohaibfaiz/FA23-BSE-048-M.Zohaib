import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export function PublicLayout({ children }) {
  return (
    <div className="public-site">
      <PublicHeader />
      <main>{children || <Outlet />}</main>
      <PublicFooter />
    </div>
  );
}
