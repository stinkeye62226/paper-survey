import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Users, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function SurveyLanding() {
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchQuestionCount() {
      try {
        const { data, error } = await supabase
          .from('survey_questions')
          .select('id')
          .eq('is_active', true)
          .order('display_order')
        
        if (error) throw error
        setTotalQuestions(data?.length || 0)
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionCount()
  }, [])

  return (
    <div className="min-h-screen bg-natural-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-driscoll-green/5 via-transparent to-strawberry-red/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-8">
                <img 
                  src="/images/transparent_driscolls.png" 
                  alt="Driscoll's - Only the Finest Berries" 
                  className="h-16 md:h-20 mx-auto object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-light text-dark-warm-grey tracking-tight mb-4">
                Packaging
                <span className="block font-normal text-driscoll-green">Concept Survey</span>
              </h1>
              <p className="text-xl text-dark-warm-grey/80 max-w-2xl mx-auto leading-relaxed">
                Help us shape the future of sustainable packaging. Your insights matter in creating better experiences for everyone.
              </p>
            </div>

            {/* Key Information Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blueberry-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blueberry-blue" />
                </div>
                <h3 className="font-medium text-dark-warm-grey mb-2">Quick & Easy</h3>
                <p className="text-sm text-dark-warm-grey/70">
                  {isLoading ? 'Loading...' : `${totalQuestions} thoughtful questions`}<br />
                  Takes just 3-5 minutes
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-raspberry-pink/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-raspberry-pink" />
                </div>
                <h3 className="font-medium text-dark-warm-grey mb-2">Your Voice Matters</h3>
                <p className="text-sm text-dark-warm-grey/70">
                  Join thousands of customers<br />
                  shaping packaging innovation
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blackberry-purple/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-blackberry-purple" />
                </div>
                <h3 className="font-medium text-dark-warm-grey mb-2">Completely Anonymous</h3>
                <p className="text-sm text-dark-warm-grey/70">
                  No personal information<br />
                  required or collected
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Link
                to="/survey"
                className="inline-flex items-center px-8 py-4 bg-driscoll-green text-white font-medium rounded-2xl hover:bg-driscoll-green/90 transition-colors shadow-lg hover:shadow-xl group"
              >
                Start Survey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="text-sm text-dark-warm-grey/60">
                Your feedback helps us create better, more sustainable packaging solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-light text-dark-warm-grey mb-8">
              Why Your Feedback Matters
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-driscoll-green">
                  Sustainable Innovation
                </h3>
                <p className="text-dark-warm-grey/80 leading-relaxed">
                  We're committed to developing packaging that protects your fresh produce while minimizing environmental impact. Your insights guide our sustainability efforts.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-driscoll-green">
                  Enhanced Experience
                </h3>
                <p className="text-dark-warm-grey/80 leading-relaxed">
                  From ease of opening to product visibility, every detail matters. Help us understand what makes packaging work better for you and your family.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Link */}
      <div className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link 
              to="/admin/login" 
              className="text-sm text-dark-warm-grey/60 hover:text-driscoll-green transition-colors"
            >
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}