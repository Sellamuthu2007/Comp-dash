'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Badge, Button } from '@comp-dash/design-system'
import { Calendar, MapPin, Users, Clock, Trophy, ArrowLeft, ExternalLink, Tag, Info, ChevronRight, Globe, Building2, GraduationCap, Target } from 'lucide-react'

const categoryGradients: Record<string, string> = {
  hackathon: 'from-violet-500 to-purple-600',
  internship: 'from-blue-500 to-cyan-600',
  workshop: 'from-amber-500 to-orange-600',
  paper_presentation: 'from-emerald-500 to-teal-600',
  project: 'from-rose-500 to-pink-600',
  sports: 'from-green-500 to-emerald-600',
  cultural: 'from-pink-500 to-rose-600',
}

export default function CompetitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [comp, setComp] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/competitions/${params.id}`)
      .then(r => r.json())
      .then(j => setComp(j.data))
      .catch(() => setComp(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!comp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Info className="w-12 h-12 mb-3" />
        <p className="text-sm font-medium">Competition not found</p>
        <button onClick={() => router.back()} className="text-sm text-accent mt-2 hover:underline">Go back</button>
      </div>
    )
  }

  const deadline = new Date(comp.registrationDeadline)
  const isOpen = deadline > new Date()
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Competitions
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${categoryGradients[comp.category] || 'from-gray-400 to-gray-500'}`} />
        
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">{comp.category.replace('_', ' ')}</Badge>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {isOpen ? (daysLeft > 0 ? `${daysLeft} days left` : 'Closing soon') : 'Registration closed'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{comp.title}</h1>
              <p className="text-sm text-gray-500 mt-1">by {comp.organizer}</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{comp.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Dates
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(comp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' - '}
                {new Date(comp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Deadline
              </div>
              <p className="text-sm font-medium text-gray-900">
                {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {!isOpen && <span className="text-red-500 ml-1">(Closed)</span>}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Trophy className="w-3.5 h-3.5" />
                Prize Pool
              </div>
              <p className="text-sm font-bold text-accent">{comp.prizePool || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Mode
              </div>
              <p className="text-sm font-medium text-gray-900 capitalize">{comp.mode}</p>
              {comp.venue && <p className="text-xs text-gray-500 mt-0.5">{comp.venue}</p>}
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Globe className="w-3.5 h-3.5" />
                Scope
              </div>
              <p className="text-sm font-medium text-gray-900 capitalize">{comp.scope}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                Team Size
              </div>
              <p className="text-sm font-medium text-gray-900">{comp.teamSizeMin} - {comp.teamSizeMax} members</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                Organizer
              </div>
              <p className="text-sm font-medium text-gray-900">{comp.organizer}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Eligibility</p>
                <p className="text-xs text-blue-700 mt-1">{comp.eligibility?.description || 'Open to all CSE students'}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {comp.eligibility?.departments?.map((d: string) => (
                    <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">{d}</span>
                  ))}
                  {comp.eligibility?.yearOfStudy?.map((y: string) => (
                    <span key={y} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">{y} Year</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {comp.tags && comp.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {comp.tags.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>
          )}

          <a href={comp.registrationUrl || comp.websiteUrl || '#'}
            target="_blank" rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all ${
              isOpen ? 'bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20' : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={e => { if (!isOpen) e.preventDefault() }}
          >
            <ExternalLink className="w-4 h-4" />
            {isOpen ? 'Register Now' : 'Registration Closed'}
          </a>

          {comp.contactEmail && (
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span>📧 {comp.contactEmail}</span>
              {comp.contactPhone && <span>📞 {comp.contactPhone}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
