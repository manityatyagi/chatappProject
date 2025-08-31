import React, { useState } from 'react';
import { ImageIcon, Wand2, X, Download, Copy, Check } from 'lucide-react';
import { cn } from '../libs/utils';
import api from '../api/axios';

const ImageGenerator = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data } = await api.post('/api/ai/generate-image', { 
        prompt: prompt.trim(),
        userId: 'current-user-id' 
      });
      setGeneratedImage(data);
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (generatedImage?.enhancedPrompt) {
      await navigator.clipboard.writeText(generatedImage.enhancedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
    
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">AI Image Generator</h2>
              <p className="text-sm text-secondary-500">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        <div className="p-6 space-y-6">

          <div className="space-y-3">
            <label className="text-sm font-medium text-secondary-900">
              Describe the image you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at sunset with flying cars..."
              className="w-full h-24 resize-none border border-secondary-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>


          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200",
              prompt.trim() && !isGenerating
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "bg-secondary-100 text-secondary-400 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Image</span>
              </>
            )}
          </button>


          {generatedImage && (
            <div className="space-y-4 p-4 bg-secondary-50 rounded-xl">
              <div className="relative">
                <img
                  src={generatedImage.imageUrl}
                  alt="Generated image"
                  className="w-full rounded-lg shadow-soft"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button className="p-2 bg-white rounded-lg shadow-soft text-secondary-600 hover:text-secondary-900 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {generatedImage.enhancedPrompt && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-700">Enhanced Prompt:</span>
                    <button
                      onClick={handleCopyPrompt}
                      className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700"
                    >
                      {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPrompt ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-secondary-600 bg-white p-3 rounded-lg">
                    {generatedImage.enhancedPrompt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
