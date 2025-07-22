import React from 'react';
import { CheckCircle, Heart } from 'lucide-react';

interface SurveyCompleteProps {
  onReturnHome: () => void;
}

export default function SurveyComplete({ onReturnHome }: SurveyCompleteProps) {
  return (
    <div className="min-h-screen bg-natural-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-driscoll-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-driscoll-green" />
          </div>
          
          <img 
            src="/images/transparent_driscolls.png" 
            alt="Driscoll's - Only the Finest Berries" 
            className="h-16 mx-auto object-contain mb-6"
          />
        </div>

        {/* Thank You Message */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-light text-dark-warm-grey">
            Thank You!
          </h1>
          
          <div className="space-y-4 text-dark-warm-grey/80">
            <p className="text-xl leading-relaxed">
              Your feedback has been successfully submitted and is incredibly valuable to us.
            </p>
            
            <p className="text-lg">
              At Driscoll's, we're committed to creating packaging that delights our customers while protecting our precious berries. Your insights help us innovate responsibly and sustainably.
            </p>
          </div>

          {/* Appreciation Note */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
            <div className="flex items-center justify-center gap-3 text-strawberry-red mb-3">
              <Heart className="w-5 h-5" />
              <span className="font-medium">From Our Family to Yours</span>
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-dark-warm-grey/70 italic">
              "Every piece of feedback brings us closer to creating the perfect berry experience. Thank you for being part of our journey towards better, more sustainable packaging."
            </p>
          </div>
        </div>

        {/* Return Button */}
        <button
          onClick={onReturnHome}
          className="mt-8 px-8 py-3 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}