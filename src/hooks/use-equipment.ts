"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveEquipment,
  createEquipmentReview,
  createEquipment,
  deleteOwnerEquipment,
  equipmentQueryKeys,
  geocodeEquipment,
  getAddressLocationByPlaceId,
  getAddressSuggestions,
  getFeaturedEquipment,
  getEquipmentReviews,
  getMyEquipment,
  getPendingEquipment,
  getPublicEquipment,
  getPublicEquipmentById,
  rejectEquipment,
  saveDraftEquipment,
  submitOwnerEquipment,
  updateEquipmentReview,
  type CreateEquipmentReviewInput,
  type AddressSuggestionsInput,
  type CreateEquipmentInput,
  type GeocodeEquipmentInput,
  type PlaceIdInput,
  type RejectEquipmentInput,
  type SaveDraftEquipmentInput,
  type UpdateEquipmentReviewInput,
  type UpdateEquipmentInput,
  updateOwnerEquipment,
} from "@/lib/equipment";

export function useOwnerEquipmentQuery() {
  return useQuery({
    queryKey: equipmentQueryKeys.ownerListings,
    queryFn: getMyEquipment,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePendingEquipmentQuery(enabled = true) {
  return useQuery({
    queryKey: equipmentQueryKeys.pendingListings,
    queryFn: getPendingEquipment,
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useFeaturedEquipmentQuery() {
  return useQuery({
    queryKey: equipmentQueryKeys.featuredListings,
    queryFn: getFeaturedEquipment,
    staleTime: 60 * 1000,
  });
}

export function usePublicEquipmentListingsQuery(categoryId?: string, enabled = true) {
  return useQuery({
    queryKey: equipmentQueryKeys.publicListings(categoryId),
    queryFn: () => getPublicEquipment({ categoryId }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function usePublicEquipmentQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: equipmentQueryKeys.publicListing(id),
    queryFn: () => getPublicEquipmentById(id),
    enabled: enabled && id.trim().length > 0,
    staleTime: 60 * 1000,
  });
}

export function useEquipmentReviewsQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: [...equipmentQueryKeys.publicListing(id), "reviews"],
    queryFn: () => getEquipmentReviews(id),
    enabled: enabled && id.trim().length > 0,
    staleTime: 30 * 1000,
  });
}

export function useGeocodeEquipmentMutation() {
  return useMutation({
    mutationFn: (input: GeocodeEquipmentInput) => geocodeEquipment(input),
  });
}

export function useCreateEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEquipmentInput) => createEquipment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
    },
  });
}

export function useSaveDraftEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveDraftEquipmentInput) => saveDraftEquipment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
    },
  });
}

export function useUpdateOwnerEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEquipmentInput }) =>
      updateOwnerEquipment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.pendingListings });
    },
  });
}

export function useSubmitOwnerEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEquipmentInput }) =>
      submitOwnerEquipment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.pendingListings });
    },
  });
}

export function useDeleteOwnerEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOwnerEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.pendingListings });
    },
  });
}

export function useApproveEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.pendingListings });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
    },
  });
}

export function useRejectEquipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectEquipmentInput }) =>
      rejectEquipment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.pendingListings });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.ownerListings });
    },
  });
}

export function useCreateEquipmentReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateEquipmentReviewInput }) =>
      createEquipmentReview(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.publicListing(variables.id) });
    },
  });
}

export function useUpdateEquipmentReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEquipmentReviewInput }) =>
      updateEquipmentReview(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.publicListing(variables.id) });
    },
  });
}

export function useAddressSuggestionsQuery(input: string, enabled = true) {
  return useQuery({
    queryKey: ["equipment", "address-suggestions", input],
    queryFn: () => getAddressSuggestions({ input } satisfies AddressSuggestionsInput),
    enabled: enabled && input.trim().length >= 2,
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useAddressLocationMutation() {
  return useMutation({
    mutationFn: (input: PlaceIdInput) => getAddressLocationByPlaceId(input),
  });
}
