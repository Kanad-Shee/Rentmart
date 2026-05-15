import { apiRequest } from "./http";
import type { EquipmentListing } from "./equipment";

export const wishlistQueryKeys = {
  mine: ["wishlist", "mine"] as const,
};

export async function getMyWishlist() {
  const response = await apiRequest<EquipmentListing[]>("/wishlists/mine");
  return response.data;
}

export async function addToWishlist(equipmentId: string) {
  const response = await apiRequest<EquipmentListing>(`/wishlists/${equipmentId}`, {
    method: "POST",
  });

  return response.data;
}

export async function removeFromWishlist(equipmentId: string) {
  const response = await apiRequest<{ equipmentId: string }>(
    `/wishlists/${equipmentId}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}
