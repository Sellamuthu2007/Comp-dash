export { apiClient } from './client'
export { useLogin, useProfile, useUpdateProfile, useUpdateNotificationPreferences, useUpdateLanguage, useLogout } from './hooks/useAuth'
export { useCompetitions, useCompetition, useUpcomingDeadlines, useTrendingCompetitions, useSearchCompetitions } from './hooks/useCompetitions'
export {
  useRegistrations,
  useRegistration,
  useRegistrationStats,
  useRegisterForCompetition,
  useVerifyRegistration,
  useDashboardStats,
  useAdminRegistrationStats,
  useStudentDashboardStats,
  useStudentHistory,
  useLeaderboardOverall,
  useLeaderboardDepartment,
  useLeaderboardDepartments,
  useCompetitionDashboard,
  useAdvisorDashboardStats,
  useHodDashboardStats,
  useCoeDashboardStats,
  useRoleAccess,
  useSendReminder,
  useCreateCompetition,
  useUpdateCompetition,
  useDeleteCompetition,
} from './hooks/useRegistrations'
export { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useUnreadNotificationCount } from './hooks/useNotifications'
export { useBookmarks, useToggleBookmark, useIsBookmarked } from './hooks/useBookmarks'
export {
  useAdminStudents,
  useAdminAdvisors,
  useAdminDepartments,
  useAdminWinners,
  useAdminAnalytics,
  useAdminAuditLogs,
} from './hooks/useAdmin'
