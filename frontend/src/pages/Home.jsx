import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react'; // Changed icon import
// import axios from "axios";
// import { BACKEND_URL } from '../config';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-[#181c20] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <span className="bg-[#23272f] backdrop-blur-lg rounded-full p-4 shadow-lg border border-white/10">
              <Zap className="w-14 h-14 text-yellow-400 drop-shadow-lg" /> {/* Changed icon */}
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
            Website Builder <span className="text-yellow-400">AI</span>
          </h1>
          <p className="text-xl text-gray-200 font-light max-w-xl mx-auto">
            Describe your dream website and let AI help you build it, step by step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#23272f] backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to build..."
              className="w-full h-36 p-5 bg-white/5 text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none placeholder-gray-400 text-lg transition"
            />
            <button
              type="submit"
              className="w-full mt-6 bg-yellow-400 text-gray-900 py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:bg-yellow-500 transition-all duration-200"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Generate Website Plan
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}