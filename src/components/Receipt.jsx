import React from 'react';
import { ChevronLeft } from 'lucide-react';

const Receipt = ({ items = [], onBackHome }) => {

  return (
    <div className="min-h-screen bg-[#f4a825] flex flex-col p-6">
      {/* Header */}
      <div className="w-full mb-6">
        <button onClick={onBackHome} className="text-white">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center">
        {/* Coffee Bag Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg mb-4">
            <div className="text-6xl">🛍️</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">Ordered</h1>
        </div>

        {/* Order Message */}
        <div className="text-center text-white">
          <p className="text-base mb-4 leading-relaxed">
            Richard, your order has been successfully placed
          </p>
          <p className="text-sm leading-relaxed">
            The order will be ready today to 18:10 at the address Tubod Iligan City.
          </p>
        </div>
      </div>

      {/* Back to Home Button */}
      <button 
        onClick={onBackHome}
        className="w-full max-w-md mx-auto bg-[#8B4513] text-white py-4 rounded-xl font-bold hover:bg-[#6B3410] transition-colors shadow-lg mt-auto"
      >
        Back to Home
      </button>
    </div>
  );
};

export default Receipt;