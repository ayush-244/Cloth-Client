import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { Menu, X, LogOut, ShoppingBag, User, ChevronDown, Search } from 'lucide-react';
import AuthPanel from '../AuthPanel';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setOpenDropdown(null);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement product search
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const categories = [
    { name: "Women's Fashion", value: 'women', path: '/products?category=women' },
    { name: "Men's Fashion", value: 'men', path: '/products?category=men' },
    { name: 'Footwear', value: 'footwear', path: '/products?category=footwear' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-white font-serif font-semibold text-xl">C</span>
            </div>
            <span className="font-serif font-light text-xl text-gray-900 hidden sm:inline tracking-tight">
              Cloth Rental
            </span>
          </Link>

          {/* Desktop Menu - Center */}
          <div className="hidden lg:flex items-center gap-1">
            {isAuthenticated && (
              <>
                {/* Categories Dropdown */}
                <div className="relative group">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                    className="px-4 py-3 flex items-center gap-2 font-light text-sm uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Categories
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'categories' ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          navigate(`/products?category=${cat.value}`);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-light text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Collections Link */}
                <Link
                  to="/products"
                  className={`px-4 py-3 font-light text-sm uppercase tracking-widest transition-colors ${
                    isActive('/products') ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Collections
                </Link>

                {/* Blog Link */}
                <button className="px-4 py-3 font-light text-sm uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors">
                  Blog
                </button>

                {/* Admin Link */}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-4 py-3 font-light text-sm uppercase tracking-widest transition-colors ${
                        isActive('/admin/dashboard') ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/orders"
                      className={`px-4 py-3 font-light text-sm uppercase tracking-widest transition-colors ${
                        isActive('/admin/orders') ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Orders
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              {searchOpen ? (
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  autoFocus
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent w-48"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </form>

            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                <button
                  onClick={() => navigate('/cart')}
                  className="relative p-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-all duration-200"
                  title="View cart"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.totalItems > 9 ? '9+' : cart.totalItems}
                    </span>
                  )}
                </button>

                {/* User Account Dropdown */}
                <div className="relative group hidden sm:block">
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-all duration-200 group-hover:scale-110"
                    title="Account"
                  >
                    <User className="w-6 h-6" />
                  </button>

                  <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-40">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full text-left px-4 py-2 text-sm font-light text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      My Account
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => navigate('/admin/dashboard')}
                          className="w-full text-left px-4 py-2 text-sm font-light text-gray-900 hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                          Admin Dashboard
                        </button>
                        <button
                          onClick={() => navigate('/admin/orders')}
                          className="w-full text-left px-4 py-2 text-sm font-light text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          Orders
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-light text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthPanelOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                title="Account"
              >
                <User className="w-6 h-6" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-900 p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 space-y-2">
            {isAuthenticated ? (
              <>
                {/* Mobile Categories */}
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'mobile-cat' ? null : 'mobile-cat')}
                  className="w-full text-left px-4 py-3 flex items-center justify-between font-light text-sm uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'mobile-cat' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'mobile-cat' && (
                  <div className="bg-gray-50 py-2 space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          navigate(`/products?category=${cat.value}`);
                          setIsOpen(false);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-8 py-2 text-sm font-light text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}

                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 font-light text-sm uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  All Collections
                </Link>

                <button className="w-full text-left px-4 py-3 font-light text-sm uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-colors">
                  Blog
                </button>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 font-light text-sm uppercase tracking-widest text-gray-900 hover:bg-gray-50 border-t border-gray-200 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 font-light text-sm uppercase tracking-widest text-gray-900 hover:bg-gray-50 border-t border-gray-200 transition-colors"
                >
                  My Account
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 font-light text-sm uppercase tracking-widest text-red-600 hover:bg-red-50 border-t border-gray-200 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsAuthPanelOpen(true);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 font-light text-sm uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Account
              </button>
            )}
          </div>
        )}

        {/* Auth Panel */}
        <AuthPanel isOpen={isAuthPanelOpen} onClose={() => setIsAuthPanelOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
