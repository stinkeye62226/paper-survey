import { Link } from 'react-router-dom'
import { CheckCircle, Heart, ArrowLeft } from 'lucide-react'

export function ThankYou() {
  return (
    <div className="min-h-screen bg-natural-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-driscoll-green/10 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-driscoll-green" />
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-dark-warm-grey mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-dark-warm-grey/80 leading-relaxed mb-6">
            Your feedback has been successfully submitted and will help us create better packaging solutions.
          </p>
        </div>

        {/* Appreciation Message */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-center gap-2 text-raspberry-pink mb-4">
            <Heart className="w-5 h-5" />
            <span className="font-medium">We appreciate your time</span>
          </div>
          <p className="text-dark-warm-grey/70 leading-relaxed">
            Your insights are invaluable in our mission to develop sustainable, user-friendly packaging that enhances your experience with fresh, quality produce.
          </p>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-medium text-dark-warm-grey">
            What happens next?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="font-medium text-driscoll-green mb-2">Analysis</div>
              <p className="text-sm text-dark-warm-grey/70">
                Our team will carefully review all feedback to identify key insights and improvement opportunities.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="font-medium text-driscoll-green mb-2">Innovation</div>
              <p className="text-sm text-dark-warm-grey/70">
                Your feedback will directly influence our next generation of packaging designs and features.
              </p>
            </div>
          </div>
        </div>

        {/* Return Home */}
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-dark-warm-grey hover:text-driscoll-green transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Home
        </Link>
      </div>
    </div>
  )
}