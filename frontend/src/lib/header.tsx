import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onBack, 
  showBackButton = true 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 w-full h-16 flex items-center pl-12">
      <div className="flex items-center w-full">
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 mr-4 transition-all duration-200 rounded-lg px-3 py-2
              hover:bg-blue-50 hover:text-blue-700 hover:shadow hover:scale-105"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Zurück</span>
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default Header;