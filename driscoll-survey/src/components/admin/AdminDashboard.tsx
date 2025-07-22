import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LogOut, 
  BarChart3, 
  Settings, 
  Download, 
  Users, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, SurveyQuestion, SurveyResponse, SurveySession } from '@/lib/supabase'

type TabType = 'overview' | 'questions' | 'responses' | 'sessions'

interface DashboardStats {
  totalQuestions: number
  totalResponses: number
  totalSessions: number
  completionRate: number
}

interface EditingQuestion {
  id?: number
  question_text: string
  question_type: 'text' | 'scale' | 'multiple_choice'
  is_required: boolean
  display_order: number
  is_active: boolean
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalResponses: 0,
    totalSessions: 0,
    completionRate: 0
  })
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [sessions, setSessions] = useState<SurveySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchQuestions(),
        fetchResponses(),
        fetchSessions()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [questionsData, responsesData, sessionsData] = await Promise.all([
        supabase.from('survey_questions').select('id').eq('is_active', true),
        supabase.from('survey_responses').select('id'),
        supabase.from('survey_sessions').select('id, is_completed')
      ])

      const totalQuestions = questionsData.data?.length || 0
      const totalResponses = responsesData.data?.length || 0
      const totalSessions = sessionsData.data?.length || 0
      const completedSessions = sessionsData.data?.filter(s => s.is_completed).length || 0
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

      setStats({
        totalQuestions,
        totalResponses,
        totalSessions,
        completionRate
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_questions')
        .select('*')
        .order('display_order')
      
      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false })
      
      if (error) throw error
      setResponses(data || [])
    } catch (error) {
      console.error('Error fetching responses:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_sessions')
        .select('*')
        .order('started_at', { ascending: false })
      
      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const saveQuestion = async () => {
    if (!editingQuestion) return
    
    try {
      const questionData = {
        question_text: editingQuestion.question_text,
        question_type: editingQuestion.question_type,
        is_required: editingQuestion.is_required,
        display_order: editingQuestion.display_order,
        is_active: editingQuestion.is_active,
        updated_at: new Date().toISOString()
      }

      if (editingQuestion.id) {
        // Update existing question
        const { error } = await supabase
          .from('survey_questions')
          .update(questionData)
          .eq('id', editingQuestion.id)
        
        if (error) throw error
        toast.success('Question updated successfully')
      } else {
        // Create new question
        const { error } = await supabase
          .from('survey_questions')
          .insert({
            ...questionData,
            created_at: new Date().toISOString()
          })
        
        if (error) throw error
        toast.success('Question created successfully')
      }

      setEditingQuestion(null)
      await fetchQuestions()
      await fetchStats()
    } catch (error: any) {
      console.error('Error saving question:', error)
      toast.error(error.message || 'Failed to save question')
    }
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    try {
      const { error } = await supabase
        .from('survey_questions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Question deleted successfully')
      await fetchQuestions()
      await fetchStats()
    } catch (error: any) {
      console.error('Error deleting question:', error)
      toast.error(error.message || 'Failed to delete question')
    }
  }

  const exportData = async (type: 'responses' | 'sessions') => {
    try {
      let data: any[]
      let filename: string
      
      if (type === 'responses') {
        // Get responses and questions separately (best practice without foreign keys)
        const { data: rawResponses, error: responsesError } = await supabase
          .from('survey_responses')
          .select('*')
          .order('submitted_at', { ascending: false })
        
        if (responsesError) throw responsesError
        
        // Get questions for reference
        const { data: questionsData, error: questionsError } = await supabase
          .from('survey_questions')
          .select('id, question_text, question_type')
        
        if (questionsError) throw questionsError
        
        // Manually join responses with question text
        data = (rawResponses || []).map(response => ({
          ...response,
          question_text: questionsData?.find(q => q.id === response.question_id)?.question_text || 'Unknown Question',
          question_type: questionsData?.find(q => q.id === response.question_id)?.question_type || 'unknown'
        }))
        
        filename = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`
      } else {
        data = sessions
        filename = `survey_sessions_${new Date().toISOString().split('T')[0]}.csv`
      }

      if (data.length === 0) {
        toast.error('No data to export')
        return
      }

      // Convert to CSV
      const headers = Object.keys(data[0]).join(',')
      const csvContent = [
        headers,
        ...data.map(row => 
          Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',')
        )
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      
      toast.success(`${type} exported successfully`)
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export data')
    }
  }

  const filteredQuestions = showInactive ? questions : questions.filter(q => q.is_active)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-natural-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-dark-warm-grey text-lg font-medium mb-2">
            Loading Dashboard...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-natural-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-dark-warm-grey">
                Survey Dashboard
              </h1>
              <p className="text-sm text-dark-warm-grey/60">
                Welcome back, {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-dark-warm-grey hover:text-strawberry-red transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'questions', label: 'Questions', icon: FileText },
              { id: 'responses', label: 'Responses', icon: Users },
              { id: 'sessions', label: 'Sessions', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-driscoll-green text-driscoll-green'
                      : 'border-transparent text-dark-warm-grey/60 hover:text-dark-warm-grey hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-warm-grey/60">Total Questions</p>
                    <p className="text-3xl font-light text-dark-warm-grey">{stats.totalQuestions}</p>
                  </div>
                  <div className="w-12 h-12 bg-driscoll-green/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-driscoll-green" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-warm-grey/60">Total Responses</p>
                    <p className="text-3xl font-light text-dark-warm-grey">{stats.totalResponses}</p>
                  </div>
                  <div className="w-12 h-12 bg-blueberry-blue/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blueberry-blue" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-warm-grey/60">Survey Sessions</p>
                    <p className="text-3xl font-light text-dark-warm-grey">{stats.totalSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-raspberry-pink/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-raspberry-pink" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-warm-grey/60">Completion Rate</p>
                    <p className="text-3xl font-light text-dark-warm-grey">{stats.completionRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blackberry-purple/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blackberry-purple" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-dark-warm-grey mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => exportData('responses')}
                  className="flex items-center px-4 py-2 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Responses
                </button>
                <button
                  onClick={() => exportData('sessions')}
                  className="flex items-center px-4 py-2 bg-blueberry-blue text-white rounded-xl hover:bg-blueberry-blue/90 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Sessions
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="flex items-center px-4 py-2 bg-raspberry-pink text-white rounded-xl hover:bg-raspberry-pink/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Questions Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-dark-warm-grey">Survey Questions</h2>
                <p className="text-sm text-dark-warm-grey/60">Manage your survey questions and settings</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className="flex items-center px-3 py-2 text-sm text-dark-warm-grey hover:text-driscoll-green transition-colors"
                >
                  {showInactive ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                </button>
                <button
                  onClick={() => setEditingQuestion({
                    question_text: '',
                    question_type: 'text',
                    is_required: true,
                    display_order: questions.length + 1,
                    is_active: true
                  })}
                  className="flex items-center px-4 py-2 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-driscoll-green/10 rounded-full text-sm font-medium text-driscoll-green">
                          {question.display_order}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          question.question_type === 'text' 
                            ? 'bg-blue-100 text-blue-800'
                            : question.question_type === 'scale'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {question.question_type}
                        </span>
                        {question.is_required && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-medium">
                            Required
                          </span>
                        )}
                        {!question.is_active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-dark-warm-grey leading-relaxed">{question.question_text}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingQuestion({
                          id: question.id,
                          question_text: question.question_text,
                          question_type: question.question_type as 'text' | 'scale' | 'multiple_choice',
                          is_required: question.is_required,
                          display_order: question.display_order,
                          is_active: question.is_active
                        })}
                        className="p-2 text-dark-warm-grey hover:text-driscoll-green transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 text-dark-warm-grey hover:text-strawberry-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-dark-warm-grey">Survey Responses</h2>
                <p className="text-sm text-dark-warm-grey/60">View and analyze customer feedback</p>
              </div>
              <button
                onClick={() => exportData('responses')}
                className="flex items-center px-4 py-2 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {responses.slice(0, 50).map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey">
                          {response.session_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey">
                          Q{response.question_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-dark-warm-grey max-w-xs truncate">
                          {response.response_text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey/60">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {responses.length === 0 && (
                <div className="p-8 text-center text-dark-warm-grey/60">
                  No responses found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-dark-warm-grey">Survey Sessions</h2>
                <p className="text-sm text-dark-warm-grey/60">Track survey completion and progress</p>
              </div>
              <button
                onClick={() => exportData('sessions')}
                className="flex items-center px-4 py-2 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sessions.map((session) => {
                      const progress = session.total_questions > 0 
                        ? (session.completed_questions / session.total_questions) * 100 
                        : 0
                      
                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey">
                            {session.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey/60">
                            {new Date(session.started_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                <div 
                                  className="bg-driscoll-green h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs">{Math.round(progress)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              session.is_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {session.is_completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-warm-grey/60">
                            {session.completed_at 
                              ? new Date(session.completed_at).toLocaleDateString()
                              : '-'
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {sessions.length === 0 && (
                <div className="p-8 text-center text-dark-warm-grey/60">
                  No sessions found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-dark-warm-grey">
                {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-2 text-dark-warm-grey hover:text-strawberry-red transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-dark-warm-grey mb-2">
                  Question Text
                </label>
                <textarea
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-driscoll-green focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter your question here..."
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-dark-warm-grey mb-2">
                  Question Type
                </label>
                <select
                  value={editingQuestion.question_type}
                  onChange={(e) => setEditingQuestion({ 
                    ...editingQuestion, 
                    question_type: e.target.value as 'text' | 'scale' | 'multiple_choice'
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-driscoll-green focus:border-transparent"
                >
                  <option value="text">Text Response</option>
                  <option value="scale">Rating Scale (1-10)</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-dark-warm-grey mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingQuestion.display_order}
                    onChange={(e) => setEditingQuestion({ 
                      ...editingQuestion, 
                      display_order: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-driscoll-green focus:border-transparent"
                    min="1"
                  />
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_required"
                      checked={editingQuestion.is_required}
                      onChange={(e) => setEditingQuestion({ 
                        ...editingQuestion, 
                        is_required: e.target.checked
                      })}
                      className="w-4 h-4 text-driscoll-green bg-gray-100 border-gray-300 rounded focus:ring-driscoll-green focus:ring-2"
                    />
                    <label htmlFor="is_required" className="ml-2 text-sm text-dark-warm-grey">
                      Required Question
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editingQuestion.is_active}
                      onChange={(e) => setEditingQuestion({ 
                        ...editingQuestion, 
                        is_active: e.target.checked
                      })}
                      className="w-4 h-4 text-driscoll-green bg-gray-100 border-gray-300 rounded focus:ring-driscoll-green focus:ring-2"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-dark-warm-grey">
                      Active Question
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="px-6 py-2 text-dark-warm-grey hover:text-strawberry-red transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuestion}
                  disabled={!editingQuestion.question_text.trim()}
                  className="flex items-center px-6 py-2 bg-driscoll-green text-white rounded-xl hover:bg-driscoll-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingQuestion.id ? 'Update' : 'Create'} Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}