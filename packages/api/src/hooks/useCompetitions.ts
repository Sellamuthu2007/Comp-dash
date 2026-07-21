import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type {
  Competition,
  CompetitionDetail,
  CompetitionListResponse,
  CompetitionFilters,
} from '@comp-dash/types'

export function useCompetitions(filters?: CompetitionFilters) {
  return useQuery({
    queryKey: ['competitions', filters],
    queryFn: () =>
      apiClient.get<CompetitionListResponse>('/competitions', filters as Record<string, unknown>),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: ['competitions', id],
    queryFn: () => apiClient.get<CompetitionDetail>(`/competitions/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ['competitions', 'upcoming'],
    queryFn: () => apiClient.get<Competition[]>('/competitions/upcoming'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTrendingCompetitions() {
  return useQuery({
    queryKey: ['competitions', 'trending'],
    queryFn: () => apiClient.get<Competition[]>('/competitions/trending'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchCompetitions(query: string) {
  return useQuery({
    queryKey: ['competitions', 'search', query],
    queryFn: () =>
      apiClient.get<Competition[]>('/competitions/search', { q: query }),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  })
}
