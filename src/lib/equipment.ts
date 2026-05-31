import { apiRequest } from './http';
import {
  buildPaginationSearchParams,
  type PaginatedResponse,
  type PaginationInput
} from './pagination';

export type EquipmentStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'REJECTED';

export type EquipmentCategory = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type EquipmentImageSummary = {
  id: string;
  url: string;
  position: number;
};

export type EquipmentReviewImageSummary = {
  id: string;
  url: string;
  position: number;
};

export type EquipmentReviewSummary = {
  id: string;
  rating: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  renter: {
    id: string;
    fullName: string;
  };
  images: EquipmentReviewImageSummary[];
};

export type EquipmentReviewViewerState = {
  isLoggedIn: boolean;
  canReview: boolean;
  code:
    | 'NOT_AUTHENTICATED'
    | 'ROLE_NOT_ALLOWED'
    | 'BOOKING_NOT_COMPLETED'
    | 'CAN_CREATE'
    | 'CAN_UPDATE';
  message: string;
  review: EquipmentReviewSummary | null;
};

export type EquipmentReviewSummaryDigest = {
  text: string;
  generatedAt: string;
  reviewCount: number;
  visible?: boolean;
};

export type EquipmentOwnerSummary = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string;
  phoneVerified: boolean;
  createdAt: string;
};

export type EquipmentListing = {
  id: string;
  ownerId: string;
  owner: EquipmentOwnerSummary;
  title: string;
  description: string | null;
  category: EquipmentCategory;
  price: number;
  deliveryRadius: number;
  address: string;
  normalizedAddress: string;
  latitude: number;
  longitude: number;
  status: EquipmentStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: EquipmentImageSummary[];
  isWishlisted: boolean;
};

export type EquipmentDetails = EquipmentListing & {
  averageRating: number | null;
  reviewCount: number;
  reviews: EquipmentReviewSummary[];
  reviewSummary: EquipmentReviewSummaryDigest | null;
  viewerReviewState: EquipmentReviewViewerState;
};

export type EquipmentSearchSuggestionItem = {
  id: string;
  title: string;
  category: {
    id: string;
    title: string;
  };
  price: number;
  imageUrl: string;
  normalizedAddress: string;
  locationLabel: string;
  isWishlisted: boolean;
};

export type EquipmentSearchSuggestionCategory = {
  id: string;
  title: string;
  count: number;
};

export type EquipmentSearchSuggestionLocation = {
  label: string;
  count: number;
};

export type PublicEquipmentSearchSuggestions = {
  query: string;
  matches: EquipmentSearchSuggestionItem[];
  related: EquipmentSearchSuggestionItem[];
  categorySuggestions: EquipmentSearchSuggestionCategory[];
  locationSuggestions: EquipmentSearchSuggestionLocation[];
};

export type EquipmentReviewPayload = {
  equipmentId: string;
  averageRating: number | null;
  reviewCount: number;
  reviews: EquipmentReviewSummary[];
  viewerReviewState: EquipmentReviewViewerState;
};

export type GenerateListingDescriptionInput = {
  title: string;
  description: string;
};

export type GenerateListingDescriptionResponse = {
  description: string;
};

export type AdminEquipmentReviewSummaryItem = EquipmentListing & {
  averageRating: number | null;
  reviewCount: number;
  reviewSummaryVisible: boolean;
  reviewSummary: EquipmentReviewSummaryDigest | null;
};

export type AdminEquipmentReviewSummaryQueryInput = PaginationInput & {
  search?: string;
};

export type GenerateEquipmentReviewSummaryResponse = {
  reviewSummary: EquipmentReviewSummaryDigest;
  reviewSummaryVisible: boolean;
  averageRating: number | null;
  reviewCount: number;
};

export type UpdateEquipmentReviewSummaryVisibilityInput = {
  visible: boolean;
};

export type UpdateEquipmentReviewSummaryVisibilityResponse = {
  reviewSummary: EquipmentReviewSummaryDigest | null;
  reviewSummaryVisible: boolean;
  averageRating: number | null;
  reviewCount: number;
};

export type GeocodedEquipmentLocation = {
  normalizedAddress: string;
  latitude: number;
  longitude: number;
};

export type AddressSuggestion = {
  placeId: string;
  description: string;
  primaryText: string;
  secondaryText: string;
};

export type CreateEquipmentInput = {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  deliveryRadius: number;
  address: string;
  images: File[];
};

export type SaveDraftEquipmentInput = CreateEquipmentInput;

export type UpdateEquipmentInput = {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  deliveryRadius: number;
  address: string;
  images: File[];
  retainedImageIds: string[];
};

export type GeocodeEquipmentInput = {
  address: string;
};

export type AddressSuggestionsInput = {
  input: string;
};

export type PlaceIdInput = {
  placeId: string;
};

export type RejectEquipmentInput = {
  reason: string;
};

export type CreateEquipmentReviewInput = {
  rating: number;
  title: string;
  description: string;
  photos: File[];
};

export type UpdateEquipmentReviewInput = CreateEquipmentReviewInput & {
  retainedPhotoIds: string[];
};

export type OwnerEquipmentQueryInput = PaginationInput & {
  tab?: 'live' | 'pending' | 'draft';
};

export type PendingEquipmentQueryInput = PaginationInput & {
  search?: string;
};

export type PublicEquipmentQueryInput = PaginationInput & {
  categoryId?: string;
  search?: string;
};

export type PublicEquipmentSearchSuggestionsInput = {
  q: string;
};

export const equipmentQueryKeys = {
  ownerListings: ['equipment', 'owner-listings'] as const,
  pendingListings: ['equipment', 'pending-listings'] as const,
  ownerListingsPage: (input: OwnerEquipmentQueryInput) =>
    [
      'equipment',
      'owner-listings',
      input.page ?? 1,
      input.pageSize ?? 10,
      input.tab ?? 'live'
    ] as const,
  pendingListingsPage: (input: PendingEquipmentQueryInput) =>
    [
      'equipment',
      'pending-listings',
      input.page ?? 1,
      input.pageSize ?? 10,
      input.search?.trim() ?? ''
    ] as const,
  adminReviewSummariesPage: (input: AdminEquipmentReviewSummaryQueryInput) =>
    [
      'equipment',
      'admin-review-summaries',
      input.page ?? 1,
      input.pageSize ?? 10,
      input.search?.trim() ?? ''
    ] as const,
  featuredListings: ['equipment', 'featured-listings'] as const,
  publicListings: (categoryId?: string) =>
    ['equipment', 'public-listings', categoryId ?? 'all'] as const,
  publicListingsPage: (input: PublicEquipmentQueryInput) =>
    [
      'equipment',
      'public-listings-page',
      input.categoryId ?? 'all',
      input.search?.trim() ?? '',
      input.page ?? 1,
      input.pageSize ?? 12
    ] as const,
  publicSearchSuggestions: (query: string) =>
    ['equipment', 'public-search-suggestions', query.trim()] as const,
  publicListing: (id: string) => ['equipment', 'public-listing', id] as const
};

function createEquipmentFormData(input: CreateEquipmentInput) {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('categoryId', input.categoryId);
  formData.append('price', String(input.price));
  formData.append('deliveryRadius', String(input.deliveryRadius));
  formData.append('address', input.address);

  for (const image of input.images) {
    formData.append('images', image);
  }

  return formData;
}

function createUpdateEquipmentFormData(input: UpdateEquipmentInput) {
  const formData = createEquipmentFormData(input);

  for (const imageId of input.retainedImageIds) {
    formData.append('retainedImageIds', imageId);
  }

  return formData;
}

function createEquipmentReviewFormData(input: CreateEquipmentReviewInput) {
  const formData = new FormData();
  formData.append('rating', String(input.rating));
  formData.append('title', input.title);
  formData.append('description', input.description);

  for (const photo of input.photos) {
    formData.append('photos', photo);
  }

  return formData;
}

function createUpdateEquipmentReviewFormData(
  input: UpdateEquipmentReviewInput
) {
  const formData = createEquipmentReviewFormData(input);

  for (const photoId of input.retainedPhotoIds) {
    formData.append('retainedPhotoIds', photoId);
  }

  return formData;
}

export async function getMyEquipmentPage(input: OwnerEquipmentQueryInput = {}) {
  const searchParams = buildPaginationSearchParams(input);

  if (input.tab) {
    searchParams.set('tab', input.tab);
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<PaginatedResponse<EquipmentListing>>(
    `/equipment/mine${suffix ? `?${suffix}` : ''}`
  );
  return response.data;
}

export async function getMyEquipment() {
  const response = await getMyEquipmentPage({ page: 1, pageSize: 100 });
  return response.items;
}

export async function getPendingEquipmentPage(
  input: PendingEquipmentQueryInput = {}
) {
  const searchParams = buildPaginationSearchParams(input);

  if (input.search?.trim()) {
    searchParams.set('search', input.search.trim());
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<PaginatedResponse<EquipmentListing>>(
    `/equipment/pending${suffix ? `?${suffix}` : ''}`
  );
  return response.data;
}

export async function getPendingEquipment() {
  const response = await getPendingEquipmentPage({ page: 1, pageSize: 100 });
  return response.items;
}

export async function getAdminEquipmentReviewSummariesPage(
  input: AdminEquipmentReviewSummaryQueryInput = {}
) {
  const searchParams = buildPaginationSearchParams(input);

  if (input.search?.trim()) {
    searchParams.set('search', input.search.trim());
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<
    PaginatedResponse<AdminEquipmentReviewSummaryItem>
  >(`/equipment/admin/review-summaries${suffix ? `?${suffix}` : ''}`);

  return response.data;
}

export async function generateListingDescription(
  input: GenerateListingDescriptionInput
) {
  const response = await apiRequest<GenerateListingDescriptionResponse>(
    '/equipment/ai/listing-description',
    {
      method: 'POST',
      body: input
    }
  );

  return response.data;
}

export async function getFeaturedEquipment() {
  const response = await apiRequest<EquipmentListing[]>('/equipment/featured');
  return response.data;
}

export async function getPublicEquipment(input?: { categoryId?: string }) {
  const searchParams = new URLSearchParams();

  if (input?.categoryId?.trim()) {
    searchParams.set('categoryId', input.categoryId.trim());
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<EquipmentListing[]>(
    `/equipment${suffix ? `?${suffix}` : ''}`
  );

  return response.data;
}

export async function getPublicEquipmentSearchPage(
  input: PublicEquipmentQueryInput
) {
  const searchParams = buildPaginationSearchParams(input);

  if (input.categoryId?.trim()) {
    searchParams.set('categoryId', input.categoryId.trim());
  }

  if (input.search?.trim()) {
    searchParams.set('search', input.search.trim());
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<PaginatedResponse<EquipmentListing>>(
    `/equipment${suffix ? `?${suffix}` : ''}`
  );

  return response.data;
}

export async function getPublicEquipmentSearchSuggestions(
  input: PublicEquipmentSearchSuggestionsInput
) {
  const searchParams = new URLSearchParams({
    q: input.q.trim()
  });
  const response = await apiRequest<PublicEquipmentSearchSuggestions>(
    `/equipment/search-suggestions?${searchParams.toString()}`
  );

  return response.data;
}

export async function getPublicEquipmentById(id: string) {
  const response = await apiRequest<EquipmentDetails>(`/equipment/${id}`);
  return response.data;
}

export async function getEquipmentReviews(id: string) {
  const response = await apiRequest<EquipmentReviewPayload>(
    `/equipment/${id}/reviews`
  );
  return response.data;
}

export async function geocodeEquipment(input: GeocodeEquipmentInput) {
  const response = await apiRequest<GeocodedEquipmentLocation>(
    '/equipment/geocode',
    {
      method: 'POST',
      body: input
    }
  );

  return response.data;
}

export async function createEquipment(input: CreateEquipmentInput) {
  const response = await apiRequest<EquipmentListing>('/equipment', {
    method: 'POST',
    body: createEquipmentFormData(input)
  });

  return response.data;
}

export async function saveDraftEquipment(input: SaveDraftEquipmentInput) {
  const response = await apiRequest<EquipmentListing>('/equipment/drafts', {
    method: 'POST',
    body: createEquipmentFormData(input)
  });

  return response.data;
}

export async function getAddressSuggestions(input: AddressSuggestionsInput) {
  const searchParams = new URLSearchParams({
    input: input.input
  });
  const response = await apiRequest<AddressSuggestion[]>(
    `/equipment/address-suggestions?${searchParams.toString()}`
  );

  return response.data;
}

export async function getAddressLocationByPlaceId(input: PlaceIdInput) {
  const searchParams = new URLSearchParams({
    placeId: input.placeId
  });
  const response = await apiRequest<GeocodedEquipmentLocation>(
    `/equipment/address-details?${searchParams.toString()}`
  );

  return response.data;
}

export async function approveEquipment(id: string) {
  const response = await apiRequest<EquipmentListing>(
    `/equipment/${id}/approve`,
    {
      method: 'PATCH'
    }
  );

  return response.data;
}

export async function rejectEquipment(id: string, input: RejectEquipmentInput) {
  const response = await apiRequest<EquipmentListing>(
    `/equipment/${id}/reject`,
    {
      method: 'PATCH',
      body: input
    }
  );

  return response.data;
}

export async function updateOwnerEquipment(
  id: string,
  input: UpdateEquipmentInput
) {
  const response = await apiRequest<EquipmentListing>(`/equipment/${id}`, {
    method: 'PATCH',
    body: createUpdateEquipmentFormData(input)
  });

  return response.data;
}

export async function submitOwnerEquipment(
  id: string,
  input: UpdateEquipmentInput
) {
  const response = await apiRequest<EquipmentListing>(
    `/equipment/${id}/submit`,
    {
      method: 'PATCH',
      body: createUpdateEquipmentFormData(input)
    }
  );

  return response.data;
}

export async function deleteOwnerEquipment(id: string) {
  const response = await apiRequest<{ id: string }>(`/equipment/${id}`, {
    method: 'DELETE'
  });

  return response.data;
}

export async function createEquipmentReview(
  id: string,
  input: CreateEquipmentReviewInput
) {
  const response = await apiRequest<EquipmentReviewPayload>(
    `/equipment/${id}/reviews`,
    {
      method: 'POST',
      body: createEquipmentReviewFormData(input)
    }
  );

  return response.data;
}

export async function updateEquipmentReview(
  id: string,
  input: UpdateEquipmentReviewInput
) {
  const response = await apiRequest<EquipmentReviewPayload>(
    `/equipment/${id}/reviews/me`,
    {
      method: 'PATCH',
      body: createUpdateEquipmentReviewFormData(input)
    }
  );

  return response.data;
}

export async function generateEquipmentReviewSummary(id: string) {
  const response = await apiRequest<GenerateEquipmentReviewSummaryResponse>(
    `/equipment/${id}/review-summary/generate`,
    {
      method: 'PATCH'
    }
  );

  return response.data;
}

export async function updateEquipmentReviewSummaryVisibility(
  id: string,
  input: UpdateEquipmentReviewSummaryVisibilityInput
) {
  const response =
    await apiRequest<UpdateEquipmentReviewSummaryVisibilityResponse>(
      `/equipment/${id}/review-summary/visibility`,
      {
        method: 'PATCH',
        body: input
      }
    );

  return response.data;
}
