"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { equipmentQueryKeys } from "@/lib/equipment";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  wishlistQueryKeys,
} from "@/lib/wishlist";

function invalidateWishlistRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.mine });
  queryClient.invalidateQueries({ queryKey: ["equipment"] });
}

export function useMyWishlistQuery(enabled = true) {
  return useQuery({
    queryKey: wishlistQueryKeys.mine,
    queryFn: getMyWishlist,
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentId: string) => addToWishlist(equipmentId),
    onSuccess: (listing) => {
      queryClient.setQueryData(
        equipmentQueryKeys.publicListing(listing.id),
        listing,
      );
      invalidateWishlistRelatedQueries(queryClient);
    },
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentId: string) => removeFromWishlist(equipmentId),
    onSuccess: (_, equipmentId) => {
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.publicListing(equipmentId),
      });
      invalidateWishlistRelatedQueries(queryClient);
    },
  });
}

export function useToggleWishlistMutation() {
  const addMutation = useAddToWishlistMutation();
  const removeMutation = useRemoveFromWishlistMutation();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      isWishlisted,
    }: {
      equipmentId: string;
      isWishlisted: boolean;
    }) => {
      if (isWishlisted) {
        return removeMutation.mutateAsync(equipmentId);
      }

      return addMutation.mutateAsync(equipmentId);
    },
  });
}
