import React from 'react';

const LoadingScreen = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#f4ebe6] flex flex-col items-center justify-center p-6">
      <img src="/logo.png" alt="Mcbyte's Cafe" className="w-40 h-40 mb-10" />
      <button
        onClick={onGetStarted}
        className="bg-[#f4a825] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#e39500] transition"
      >
        GET STARTED
      </button>
    </div>
  );
};

export default LoadingScreen;
