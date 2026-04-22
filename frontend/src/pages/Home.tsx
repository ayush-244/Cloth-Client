import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products', { replace: true });
    } else {
      setIsVisible(true);
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-gray-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gray-100/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl text-center space-y-8">
          {/* Logo */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-serif text-4xl font-light">C</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div
            className={`space-y-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-5xl sm:text-6xl font-serif font-light text-gray-900 leading-tight">
              Rent Premium
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Fashion Today
              </span>
            </h1>
            <p className="text-lg font-light text-gray-600 max-w-xl mx-auto leading-relaxed">
              Discover sustainable luxury fashion. Rent designer clothes, accessories, and footwear for any occasion. Fresh style, affordable prices.
            </p>
          </div>

          {/* Features */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              { icon: Sparkles, label: 'Premium Selection' },
              { icon: TrendingUp, label: 'Best Prices' },
              { icon: ArrowRight, label: 'Fast Delivery' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-md transition-all duration-300 group"
              >
                <feature.icon className="w-6 h-6 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-light text-gray-700">{feature.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <button
              onClick={() => {
                const accountBtn = document.querySelector('button[title="Account"]') as HTMLButtonElement;
                if (accountBtn) accountBtn.click();
              }}
              className="inline-flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 font-light text-base group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* Trust Text */}
          <div
            className={`text-sm text-gray-600 font-light transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Trusted by fashion enthusiasts worldwide
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-light text-gray-600">Ready to explore premium fashion?</p>
          </div>
          <button
            onClick={() => {
              const accountBtn = document.querySelector('button[title="Account"]') as HTMLButtonElement;
              if (accountBtn) accountBtn.click();
            }}
            className="px-6 py-2 border border-gray-900 text-gray-900 rounded-md hover:bg-gray-900 hover:text-white transition-all duration-200 font-light text-sm active:scale-95"
          >
            Sign Up or Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
