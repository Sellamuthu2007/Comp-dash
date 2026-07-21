'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, Badge, Button } from '@comp-dash/design-system'
import { useLeaderboardOverall, useLeaderboardDepartments, useLeaderboardDepartment, useCompetitionDashboard, useCompetitions } from '@comp-dash/api'
import { Trophy, Users, Award, ChevronDown, Search, Medal, Star } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

type Tab = 'overall' | 'department' | 'competition'

const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
  { key: 'overall', label: 'Overall', icon: Trophy },
  { key: 'department', label: 'Department-wise', icon: Users },
  { key: 'competition', label: 'Competition-wise', icon: Award },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return <span className="text-sm font-medium text-gray-500 w-5 text-center">{rank}</span>
}

export default function LeaderboardPage() {
  const [isStudent, setIsStudent] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overall')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedComp, setSelectedComp] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    setIsStudent(user?.role === 'student')
  }, [])

  const { data: overallData, isLoading: overallLoading } = useLeaderboardOverall()
  const { data: deptsData, isLoading: deptsLoading } = useLeaderboardDepartments()
  const { data: deptDetailData, isLoading: deptDetailLoading } = useLeaderboardDepartment(
    selectedDept ? { department: selectedDept } : undefined
  )
  const { data: compsData } = useCompetitions()

  const handleDepartmentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDept(e.target.value)
  }

  const handleCompetitionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedComp(e.target.value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      <Card padding="none" className="overflow-hidden">
        {!isStudent && (
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-accent border-b-2 border-accent bg-accent/5'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}

        <div className="p-6">
          {(activeTab === 'overall' || isStudent) && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Rank</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Department</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Points</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Competitions</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {overallLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="h-10 bg-gray-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : overallData && overallData.length > 0 ? (
                    overallData.map((entry) => (
                      <tr key={entry.rank} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors even:bg-gray-50/30">
                        <td className="px-4 py-4">
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                              <Star className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{entry.studentName}</p>
                              <p className="text-xs text-gray-500">{entry.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="primary" size="sm">{entry.department}</Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-accent">{entry.points}</span>
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-gray-600">{entry.competitionsCount}</td>
                        <td className="px-4 py-4 text-right text-sm text-gray-600">{entry.wins}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">No leaderboard data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'department' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <select
                  value={selectedDept}
                  onChange={handleDepartmentSelect}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">All Departments</option>
                  {deptsData?.map((d) => (
                    <option key={d.department} value={d.department}>{d.department}</option>
                  ))}
                </select>
                {selectedDept && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDept('')}>Clear</Button>
                )}
              </div>

              {selectedDept ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Rank</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Points</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptDetailLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td colSpan={4} className="px-4 py-4">
                              <div className="h-10 bg-gray-100 rounded animate-pulse" />
                            </td>
                          </tr>
                        ))
                      ) : deptDetailData && deptDetailData.length > 0 ? (
                        deptDetailData.map((entry) => (
                          <tr key={entry.rank} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors even:bg-gray-50/30">
                            <td className="px-4 py-4">
                              <RankBadge rank={entry.rank} />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-medium text-gray-900">{entry.studentName}</p>
                                <span className="text-xs text-gray-500">{entry.email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-accent">{entry.points}</td>
                            <td className="px-4 py-4 text-right text-sm text-gray-600">{entry.wins} wins</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-gray-500">No data for this department</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deptsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))
                  ) : deptsData && deptsData.length > 0 ? (
                    deptsData.map((dept, idx) => (
                      <div
                        key={dept.department}
                        className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => setSelectedDept(dept.department)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                          <span className="text-xs text-gray-400">#{idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{dept.totalPoints} pts</span>
                          <span>{dept.totalCompetitions} comps</span>
                          <span>{dept.totalWins} wins</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${deptsData ? (dept.totalPoints / Math.max(...deptsData.map(d => d.totalPoints))) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">No department data available</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'competition' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <select
                  value={selectedComp}
                  onChange={handleCompetitionSelect}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">Select a competition...</option>
                  {compsData?.data?.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {selectedComp ? (
                <CompetitionLeaderboardTable competitionId={selectedComp} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a competition to view rankings</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function CompetitionLeaderboardTable({ competitionId }: { competitionId: string }) {
  const { data: compData } = useCompetitionDashboard(competitionId)

  if (!compData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sorted = [...compData.registeredStudents].sort(
    (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Department</th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Registered</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length > 0 ? (
            sorted.map((reg, idx) => (
              <tr key={reg.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors even:bg-gray-50/30">
                <td className="px-4 py-4">
                  <RankBadge rank={idx + 1} />
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900">{reg.userName}</p>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="primary" size="sm">{reg.department}</Badge>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={reg.status} />
                </td>
                <td className="px-4 py-4 text-right text-sm text-gray-500">
                  {new Date(reg.registeredAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-12 text-gray-500">No registrations yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'warning' | 'success' | 'info' | 'danger'; label: string }> = {
    pending_verification: { variant: 'warning', label: 'Pending' },
    verified: { variant: 'success', label: 'Verified' },
    completed: { variant: 'info', label: 'Completed' },
    rejected: { variant: 'danger', label: 'Rejected' },
  }
  const config = variants[status] || { variant: 'default' as const, label: status }
  return <Badge variant={config.variant as any} size="sm">{config.label}</Badge>
}
