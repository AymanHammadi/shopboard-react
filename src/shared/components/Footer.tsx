import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link to="/" className="brand">
          ShopBoard.
        </Link>
        <p>A little something for your everyday.</p>
        <span>© {new Date().getFullYear()} ShopBoard</span>
      </div>
    </footer>
  );
}
