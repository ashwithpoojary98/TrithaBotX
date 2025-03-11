import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };
  
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex space-x-2 items-center">
            <span className="font-bold text-xl">TrithaBotX</span>
          </div>
          <div className="hidden md:flex space-x-1">
            <Link to="/" className={`px-3 py-2 rounded hover:bg-indigo-700 ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/api-spec" className={`px-3 py-2 rounded hover:bg-indigo-700 ${isActive('/api-spec')}`}>
              New Test
            </Link>
            <Link to="/reports" className={`px-3 py-2 rounded hover:bg-indigo-700 ${isActive('/reports')}`}>
              Reports
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;