import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: any;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

export default function SurveyForm() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionId] = useState(uuidv4());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
    createSession();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      setError('Failed to load survey questions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      const { error } = await supabase
        .from('survey_sessions')
        .insert({
          id: sessionId,
          started_at: new Date().toISOString(),
          total_questions: 0, // Will update when we load questions
          completed_questions: 0,
          is_completed: false
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error creating session:', error);
    }
  };

  const updateSessionProgress = async (completedCount: number) => {
    try {
      const { error } = await supabase
        .from('survey_sessions')
        .update({
          total_questions: questions.length,
          completed_questions: completedCount
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating session:', error);
    }
  };

  const saveResponse = async (questionId: number, responseValue: any) => {
    try {
      const { error } = await supabase
        .from('survey_responses')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          response_text: typeof responseValue === 'string' ? responseValue : null,
          response_data: typeof responseValue === 'object' ? responseValue : { value: responseValue },
          submitted_at: new Date().toISOString(),
          ip_address: null, // Could be captured from server
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      await updateSessionProgress(Object.keys(responses).length + 1);
    } catch (error: any) {
      console.error('Error saving response:', error);
      throw error;
    }
  };

  const handleResponseChange = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [questions[currentIndex].id]: value
    }));
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex];
    const response = responses[currentQuestion.id];

    // Validate required questions
    if (currentQuestion.is_required && (!response || response === '')) {
      setError('This question is required');
      return;
    }

    setError(null);

    try {
      // Save response to database
      if (response !== undefined && response !== '') {
        await saveResponse(currentQuestion.id, response);
      }

      // Move to next question or complete survey
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await completeSurvey();
      }
    } catch (error: any) {
      setError('Failed to save response. Please try again.');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setError(null);
    }
  };

  const completeSurvey = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('survey_sessions')
        .update({
          completed_at: new Date().toISOString(),
          is_completed: true,
          completed_questions: questions.length
        })
        .eq('id', sessionId);

      if (error) throw error;
      navigate('/thank-you');
    } catch (error: any) {
      console.error('Error completing survey:', error);
      setError('Failed to complete survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const currentResponse = responses[question.id] || '';

    switch (question.question_type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleResponseChange(value)}
                  className={`w-16 h-16 rounded-xl border-2 font-semibold text-lg transition-all duration-200 hover:scale-105 ${
                    currentResponse === value
                      ? 'bg-driscoll-green text-white border-driscoll-green shadow-lg'
                      : 'bg-white border-gray-200 text-dark-warm-grey hover:border-driscoll-green'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-dark-warm-grey/70">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={currentResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Please share your thoughts..."
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-driscoll-green focus:outline-none resize-none text-dark-warm-grey"
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Your answer..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-driscoll-green focus:outline-none text-dark-warm-grey"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-natural-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-driscoll-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-warm-grey">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-natural-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-warm-grey">No survey questions available at this time.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-natural-white">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="h-2 bg-gradient-to-r from-driscoll-green to-strawberry-red transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <img 
            src="/images/transparent_driscolls.png" 
            alt="Driscoll's - Only the Finest Berries" 
            className="h-12 mx-auto object-contain mb-6"
          />
          <div className="text-sm text-dark-warm-grey/60 mb-2">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-light text-dark-warm-grey mb-8 text-center leading-relaxed">
            {currentQuestion.question_text}
          </h2>

          {renderQuestionInput(currentQuestion)}

          {error && (
            <div className="mt-4 p-3 bg-strawberry-red/10 border border-strawberry-red/20 rounded-lg text-strawberry-red text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-dark-warm-grey/60 hover:text-dark-warm-grey transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : currentIndex === questions.length - 1 ? (
              <>
                <Send className="w-5 h-5" />
                Complete Survey
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}