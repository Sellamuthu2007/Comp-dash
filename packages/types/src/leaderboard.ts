export interface LeaderboardEntry {
  rank: number
  studentName: string
  email: string
  department: string
  points: number
  competitionsCount: number
  wins: number
}

export interface DepartmentLeaderboardEntry {
  department: string
  totalPoints: number
  totalCompetitions: number
  totalWins: number
  studentCount: number
}

export interface CompetitionLeaderboardEntry {
  rank: number
  studentName: string
  email: string
  department: string
  score: number
  position: string
}
