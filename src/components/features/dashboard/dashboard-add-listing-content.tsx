'use client';

import { DashboardAddListingMapPreview } from '@/components/features/dashboard/dashboard-add-listing-map-preview';
import { useCurrentUserQuery } from '@/hooks/use-auth';
import { useCategoriesQuery } from '@/hooks/use-category';
import {
  useAddressLocationMutation,
  useAddressSuggestionsQuery,
  useCreateEquipmentMutation,
  useDeleteOwnerEquipmentMutation,
  useGeocodeEquipmentMutation,
  useOwnerEquipmentQuery,
  useSaveDraftEquipmentMutation,
  useSubmitOwnerEquipmentMutation,
  useUpdateOwnerEquipmentMutation
} from '@/hooks/use-equipment';
import type { Category } from '@/lib/category';
import type {
  AddressSuggestion,
  EquipmentImageSummary,
  EquipmentListing,
  GeocodedEquipmentLocation
} from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  MapPinned,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type AddListingFormState = {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  deliveryRadius: number;
  address: string;
  existingImages: EquipmentImageSummary[];
  images: File[];
};

const initialFormState: AddListingFormState = {
  title: '',
  description: '',
  categoryId: '',
  price: '',
  deliveryRadius: 45,
  address: '',
  existingImages: [],
  images: []
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryExampleSnippet(description: string) {
  const normalizedDescription = description.replace(/\s+/g, ' ').trim();
  const exampleMatch = normalizedDescription.match(/examples\s*:\s*/i);

  return !exampleMatch || exampleMatch.index === undefined
    ? normalizedDescription
    : normalizedDescription.slice(exampleMatch.index).trim();
}

export function DashboardAddListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriesQuery = useCategoriesQuery();
  const currentUserQuery = useCurrentUserQuery();
  const ownerEquipmentQuery = useOwnerEquipmentQuery();
  const createEquipmentMutation = useCreateEquipmentMutation();
  const saveDraftMutation = useSaveDraftEquipmentMutation();
  const updateOwnerEquipmentMutation = useUpdateOwnerEquipmentMutation();
  const submitOwnerEquipmentMutation = useSubmitOwnerEquipmentMutation();
  const deleteOwnerEquipmentMutation = useDeleteOwnerEquipmentMutation();
  const geocodeMutation = useGeocodeEquipmentMutation();
  const addressLocationMutation = useAddressLocationMutation();
  const [formState, setFormState] =
    useState<AddListingFormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodedEquipmentLocation | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const addressFieldRef = useRef<HTMLDivElement | null>(null);
  const categoryFieldRef = useRef<HTMLDivElement | null>(null);
  const hydratedListingIdRef = useRef<string | null>(null);
  const user = currentUserQuery.data;
  const phoneVerified = user?.phoneVerified ?? false;
  const listingId = searchParams.get('listingId');
  const editingListing =
    ownerEquipmentQuery.data?.find((listing) => listing.id === listingId) ??
    null;
  const isEditing = Boolean(listingId);
  const deferredAddress = useDeferredValue(formState.address);
  const [debouncedAddress, setDebouncedAddress] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedAddress(deferredAddress.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [deferredAddress]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!addressFieldRef.current?.contains(target)) {
        setIsSuggestionsOpen(false);
      }

      if (!categoryFieldRef.current?.contains(target)) {
        setIsCategoryMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const suggestionsQuery = useAddressSuggestionsQuery(debouncedAddress);

  const newImagePreviews = useMemo(
    () =>
      formState.images.map((file) => ({
        kind: 'new' as const,
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file)
      })),
    [formState.images]
  );

  useEffect(() => {
    return () => {
      for (const preview of newImagePreviews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [newImagePreviews]);

  const imagePreviews = useMemo(
    () => [
      ...formState.existingImages.map((image) => ({
        kind: 'existing' as const,
        id: image.id,
        name: `Saved image ${image.position + 1}`,
        size: 'Already uploaded',
        url: image.url
      })),
      ...newImagePreviews
    ],
    [formState.existingImages, newImagePreviews]
  );

  const selectedCategory =
    categoriesQuery.data?.find(
      (category) => category.id === formState.categoryId
    ) ?? null;

  useEffect(() => {
    if (
      !listingId ||
      !editingListing ||
      hydratedListingIdRef.current === listingId
    ) {
      return;
    }

    setFormState({
      title: editingListing.title,
      description: editingListing.description ?? '',
      categoryId: editingListing.category.id,
      price: String(editingListing.price),
      deliveryRadius: editingListing.deliveryRadius,
      address: editingListing.address,
      existingImages: editingListing.images,
      images: []
    });
    setSelectedLocation({
      normalizedAddress: editingListing.normalizedAddress,
      latitude: editingListing.latitude,
      longitude: editingListing.longitude
    });
    setFormError(null);
    setFormNotice(null);
    hydratedListingIdRef.current = listingId;
  }, [editingListing, listingId]);

  function applyListingToForm(listing: EquipmentListing) {
    setFormState({
      title: listing.title,
      description: listing.description ?? '',
      categoryId: listing.category.id,
      price: String(listing.price),
      deliveryRadius: listing.deliveryRadius,
      address: listing.address,
      existingImages: listing.images,
      images: []
    });
    setSelectedLocation({
      normalizedAddress: listing.normalizedAddress,
      latitude: listing.latitude,
      longitude: listing.longitude
    });
    setFormError(null);
    setFormNotice(null);
  }

  function resetForm() {
    if (editingListing) {
      applyListingToForm(editingListing);
      return;
    }

    setFormState(initialFormState);
    setFormError(null);
    setFormNotice(null);
    setSelectedLocation(null);
    setIsSuggestionsOpen(false);
    setIsCategoryMenuOpen(false);
  }

  function handleCategorySelect(categoryId: string) {
    setFormState((current) => ({
      ...current,
      categoryId
    }));
    setIsCategoryMenuOpen(false);
  }

  function handleAddressChange(nextAddress: string) {
    setFormState((current) => ({
      ...current,
      address: nextAddress
    }));
    setSelectedLocation(null);
    setFormNotice(null);
    setIsSuggestionsOpen(nextAddress.trim().length >= 2);
  }

  function handleImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    setFormState((current) => ({
      ...current,
      images: (() => {
        const remainingSlots =
          5 - current.existingImages.length - current.images.length;
        return [...current.images, ...nextFiles].slice(
          0,
          current.images.length + Math.max(remainingSlots, 0)
        );
      })()
    }));
  }

  function removeNewImage(index: number) {
    setFormState((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index)
    }));
  }

  function removeExistingImage(imageId: string) {
    setFormState((current) => ({
      ...current,
      existingImages: current.existingImages.filter(
        (image) => image.id !== imageId
      )
    }));
  }

  function validateBaseForm() {
    if (formState.title.trim().length < 2) {
      return 'Enter a valid listing title.';
    }

    if (!formState.categoryId) {
      return 'Select a category.';
    }

    const price = Number(formState.price);

    if (!Number.isFinite(price) || price <= 0) {
      return 'Price must be greater than zero.';
    }

    if (formState.deliveryRadius <= 0) {
      return 'Delivery radius must be greater than zero.';
    }

    if (formState.address.trim().length < 5) {
      return 'Enter a valid pickup address.';
    }

    return null;
  }

  function validateSubmissionForm() {
    const baseValidationError = validateBaseForm();

    if (baseValidationError) {
      return baseValidationError;
    }

    const totalImages =
      formState.existingImages.length + formState.images.length;

    if (totalImages < 3 || totalImages > 5) {
      return 'Upload between 3 and 5 images.';
    }

    return null;
  }

  function buildListingPayload() {
    return {
      title: formState.title.trim(),
      description: formState.description,
      categoryId: formState.categoryId,
      price: Number(formState.price),
      deliveryRadius: formState.deliveryRadius,
      address: formState.address.trim(),
      images: formState.images,
      retainedImageIds: formState.existingImages.map((image) => image.id)
    };
  }

  async function handleResolveAddress() {
    if (formState.address.trim().length < 5) {
      setFormError('Enter a valid pickup address before resolving it.');
      return;
    }

    setFormError(null);
    setFormNotice(null);

    try {
      const location = await geocodeMutation.mutateAsync({
        address: formState.address.trim()
      });
      setSelectedLocation(location);
      setFormNotice(`Address confirmed: ${location.normalizedAddress}`);
      toast.success('Address confirmed.', {
        description: location.normalizedAddress
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to resolve the address.'
      );
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to resolve the address.'
      );
    }
  }

  async function handleAddressSelection(suggestion: AddressSuggestion) {
    setFormError(null);
    setFormNotice(null);
    setIsSuggestionsOpen(false);
    setFormState((current) => ({
      ...current,
      address: suggestion.description
    }));

    try {
      const location = await addressLocationMutation.mutateAsync({
        placeId: suggestion.placeId
      });
      setSelectedLocation(location);
      setFormState((current) => ({
        ...current,
        address: location.normalizedAddress
      }));
      setFormNotice(`Address confirmed: ${location.normalizedAddress}`);
      toast.success('Address confirmed.', {
        description: location.normalizedAddress
      });
    } catch (error) {
      setSelectedLocation(null);
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to resolve the selected address.'
      );
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to resolve the selected address.'
      );
    }
  }

  async function handleSaveDraft() {
    const validationError = validateBaseForm();

    if (validationError) {
      setFormError(validationError);
      setFormNotice(null);
      return;
    }

    setFormError(null);
    setFormNotice(null);

    try {
      const payload = buildListingPayload();

      if (editingListing) {
        const updatedListing = await updateOwnerEquipmentMutation.mutateAsync({
          id: editingListing.id,
          input: payload
        });
        applyListingToForm(updatedListing);
        setFormNotice('Draft saved successfully.');
        toast.success('Draft saved successfully.', {
          action: {
            label: 'View equipment',
            onClick: () => {
              router.push('/dashboard/equipment');
            }
          }
        });
        return;
      }

      await saveDraftMutation.mutateAsync({
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        price: payload.price,
        deliveryRadius: payload.deliveryRadius,
        address: payload.address,
        images: payload.images
      });
      resetForm();
      setFormNotice('Draft saved successfully.');
      toast.success('Draft saved successfully.', {
        action: {
          label: 'View equipment',
          onClick: () => {
            router.push('/dashboard/equipment');
          }
        }
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to save the draft listing.'
      );
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to save the draft listing.'
      );
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateSubmissionForm();

    if (validationError) {
      setFormError(validationError);
      setFormNotice(null);
      return;
    }

    setFormError(null);
    setFormNotice(null);

    try {
      const payload = buildListingPayload();

      if (editingListing) {
        const updatedListing = await submitOwnerEquipmentMutation.mutateAsync({
          id: editingListing.id,
          input: payload
        });
        applyListingToForm(updatedListing);
        setFormNotice('Listing submitted for verification successfully.');
        toast.success('Listing submitted for verification.', {
          action: {
            label: 'Open equipment',
            onClick: () => {
              router.push('/dashboard/equipment');
            }
          }
        });
        return;
      }

      await createEquipmentMutation.mutateAsync({
        title: payload.title,
        description: payload.description,
        categoryId: payload.categoryId,
        price: payload.price,
        deliveryRadius: payload.deliveryRadius,
        address: payload.address,
        images: payload.images
      });

      resetForm();
      setFormNotice('Listing submitted for verification successfully.');
      toast.success('Listing submitted for verification.', {
        action: {
          label: 'Open equipment',
          onClick: () => {
            router.push('/dashboard/equipment');
          }
        }
      });
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 403 &&
        error.message === 'Please verify your phone number first.'
      ) {
        toast.error('Verify your phone number before creating a listing.', {
          action: {
            label: 'Open settings',
            onClick: () => {
              router.push('/dashboard/settings');
            }
          }
        });
        setFormError(
          'Verify your phone number in settings before creating a listing.'
        );
        return;
      }

      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to create the equipment listing.'
      );
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to create the equipment listing.'
      );
    }
  }

  async function handleDeleteListing() {
    if (!editingListing) {
      return;
    }

    if (!window.confirm('Delete this listing permanently?')) {
      return;
    }

    setFormError(null);
    setFormNotice(null);

    try {
      await deleteOwnerEquipmentMutation.mutateAsync(editingListing.id);
      toast.success('Listing deleted successfully.', {
        action: {
          label: 'Back to equipment',
          onClick: () => {
            router.push('/dashboard/equipment');
          }
        }
      });
      router.push('/dashboard/equipment');
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to delete the equipment listing.'
      );
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Unable to delete the equipment listing.'
      );
    }
  }

  if (categoriesQuery.isPending) {
    return (
      <section className="space-y-10 pb-12 animate-pulse">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-10 w-80 rounded bg-muted" />
          <div className="h-5 max-w-3xl rounded bg-muted" />
        </div>
        <div className="grid gap-8">
          {[0, 1, 2].map((section) => (
            <div
              key={section}
              className="rounded-xl border border-border bg-background p-8 shadow-sm">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="h-11 rounded bg-muted md:col-span-2" />
                <div className="h-11 rounded bg-muted" />
                <div className="h-11 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <section className="space-y-10 pb-12">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
            Owner Workspace
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            Create New Equipment Listing
          </h1>
        </div>
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#7a120c]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              We couldn&apos;t load categories
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
            {categoriesQuery.error instanceof ApiError
              ? categoriesQuery.error.message
              : 'Try refreshing this page in a moment.'}
          </p>
        </div>
      </section>
    );
  }

  if (isEditing && ownerEquipmentQuery.isPending) {
    return (
      <section className="space-y-10 pb-12 animate-pulse">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-10 w-80 rounded bg-muted" />
          <div className="h-5 max-w-3xl rounded bg-muted" />
        </div>
        <div className="grid gap-8">
          {[0, 1, 2].map((section) => (
            <div
              key={section}
              className="rounded-xl border border-border bg-background p-8 shadow-sm">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="h-11 rounded bg-muted md:col-span-2" />
                <div className="h-11 rounded bg-muted" />
                <div className="h-11 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isEditing && !editingListing) {
    return (
      <section className="space-y-8 pb-12">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
            Owner Workspace
          </p>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-[-0.04em] text-primary">
            Edit Equipment Listing
          </h1>
        </div>
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#7a120c]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              We couldn&apos;t find that listing
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
            It may have been deleted already or you might not have access to it.
          </p>
          <Link
            prefetch
            href="/dashboard/equipment"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]">
            Back to My Equipment
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const categories = categoriesQuery.data;
  const totalImageCount =
    formState.existingImages.length + formState.images.length;
  const isSubmitting =
    createEquipmentMutation.isPending || submitOwnerEquipmentMutation.isPending;
  const isSavingDraft =
    saveDraftMutation.isPending || updateOwnerEquipmentMutation.isPending;
  const isDeleting = deleteOwnerEquipmentMutation.isPending;
  const isResolvingAddress = geocodeMutation.isPending;
  const isSearchingAddresses = suggestionsQuery.fetchStatus === 'fetching';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 pb-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          Owner Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
          {isEditing
            ? 'Edit Equipment Listing'
            : 'Create New Equipment Listing'}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          {isEditing
            ? 'Update your machinery details, manage images, and choose whether to keep it as draft or submit it for verification.'
            : 'Provide accurate details to ensure your machinery is verified and listed as soon as possible.'}
        </p>
      </div>

      {!phoneVerified ? (
        <section className="rounded-xl border border-[#fff1c2] bg-[#fffaf0] p-6 shadow-sm">
          <div className="flex items-center gap-3 text-[#5b4300]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              Verify your phone number before submitting listings
            </h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5b4300]">
            You can still save this listing as a draft now. Phone verification
            is required only when you submit it for admin review.
          </p>
          <Link
            prefetch
            href="/dashboard/settings"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]">
            Go to Settings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      ) : null}

      <div className="space-y-8">
        <section className="rounded-xl border border-border bg-emerald-900/5 p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Basic Details
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Listing Title
              </label>
              <input
                type="text"
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    title: event.target.value
                  }))
                }
                placeholder="CAT 320 GC Hydraulic Excavator - 2022"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <span className="text-xs text-muted-foreground">
                  Optional, up to 2000 characters
                </span>
              </div>
              <textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                maxLength={2000}
                rows={6}
                placeholder="Share the machine condition, ideal use cases, included attachments, and anything renters should know before booking."
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Leave this blank if you want Rentmart to keep showing the
                standard listing description on the product details page.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Category
              </label>
              <div
                ref={categoryFieldRef}
                className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsCategoryMenuOpen((currentOpen) => !currentOpen)
                  }
                  className="flex w-full items-start justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 text-left text-sm outline-none transition-colors focus:border-primary"
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryMenuOpen}>
                  <span className="min-w-0 flex-1">
                    {selectedCategory ? (
                      <span className="block pt-0.5 font-medium text-foreground">
                        {selectedCategory.title}
                      </span>
                    ) : (
                      <span className="block pt-0.5 text-muted-foreground">
                        Select a category
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isCategoryMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isCategoryMenuOpen ? (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
                    role="listbox"
                    aria-label="Category options">
                    <div className="max-h-80 overflow-y-auto py-2">
                      {categories.map((category: Category) => {
                        const isSelected = category.id === formState.categoryId;
                        const snippet = getCategoryExampleSnippet(
                          category.description
                        );

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategorySelect(category.id)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                            role="option"
                            aria-selected={isSelected}>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-foreground">
                                {category.title}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                {snippet}
                              </span>
                            </span>
                            <span className="flex h-5 w-5 items-center justify-center">
                              {isSelected ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Price per day (INR)
              </label>
              <input
                type="number"
                min={1}
                value={formState.price}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    price: event.target.value
                  }))
                }
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                placeholder="450"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-emerald-900/2 p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Media & Documentation
          </h2>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <label className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:border-primary">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-5 text-base font-semibold text-foreground">
                Upload 3 to 5 high-resolution images
              </p>
              <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                Drag and drop your files here or click to browse. JPEG and PNG
                supported. Saved images stay attached unless you remove them.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelection}
              />
            </label>

            <div className="space-y-4">
              {imagePreviews.length > 0 ? (
                imagePreviews.map((item, index) => (
                  <div
                    key={
                      item.kind === 'existing'
                        ? item.id
                        : `${item.name}-${index}`
                    }
                    className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-background">
                        <Image
                          loading={'lazy'}
                          src={item.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          item.kind === 'existing'
                            ? removeExistingImage(item.id)
                            : removeNewImage(
                                index - formState.existingImages.length
                              )
                        }
                        className="text-muted-foreground transition-colors hover:text-[#ba1a1a]">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-medium">
                        <span className="text-primary">
                          {item.kind === 'existing'
                            ? 'Saved to listing'
                            : 'Ready to upload'}
                        </span>
                        <span className="text-primary">
                          {index + 1} / {totalImageCount}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                  Selected files will appear here once you add images.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-emerald-900/2 p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Logistics & Availability
          </h2>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Pickup Address
                </label>
                <div
                  ref={addressFieldRef}
                  className="relative">
                  <MapPinned className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={formState.address}
                    onChange={(event) =>
                      handleAddressChange(event.target.value)
                    }
                    onFocus={() => {
                      if (debouncedAddress.length >= 2) {
                        setIsSuggestionsOpen(true);
                      }
                    }}
                    className="w-full rounded-md border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                    placeholder="Industrial Estate West, Houston, TX"
                    autoComplete="off"
                  />
                  {isSuggestionsOpen && debouncedAddress.length >= 2 ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                      {isSearchingAddresses ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Searching addresses...
                        </div>
                      ) : currentUserQuery.isPending ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          Checking your account...
                        </div>
                      ) : !phoneVerified ? (
                        <div className="px-4 py-3 text-sm text-[#7a5a00]">
                          Verify your phone number to search addresses.
                        </div>
                      ) : suggestionsQuery.data &&
                        suggestionsQuery.data.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto py-2">
                          {suggestionsQuery.data.map((suggestion) => (
                            <button
                              key={suggestion.placeId}
                              type="button"
                              onClick={() => handleAddressSelection(suggestion)}
                              className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-muted">
                              <span className="text-sm font-semibold text-foreground">
                                {suggestion.primaryText}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {suggestion.secondaryText ||
                                  suggestion.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : suggestionsQuery.isError ? (
                        <div className="px-4 py-3 text-sm text-destructive">
                          {suggestionsQuery.error instanceof ApiError
                            ? suggestionsQuery.error.message
                            : 'Unable to load address suggestions.'}
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          No address suggestions found.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleResolveAddress}
                  disabled={isResolvingAddress}
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60">
                  {isResolvingAddress ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPinned className="h-4 w-4" />
                  )}
                  {isResolvingAddress ? 'Resolving...' : 'Check Address'}
                </button>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Delivery Radius
                  </label>
                  <span className="rounded bg-[#c1ecd4] px-2 py-1 text-sm font-semibold text-[#002114]">
                    {formState.deliveryRadius} km
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={formState.deliveryRadius}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      deliveryRadius: Number(event.target.value)
                    }))
                  }
                  className="w-full accent-primary"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>1km</span>
                  <span>50km</span>
                  <span>100km</span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
              <div className="relative h-full min-h-[320px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(165,208,185,0.6),_transparent_36%),linear-gradient(135deg,_rgba(27,67,50,0.65),_rgba(249,250,246,0.1))]" />
                {selectedLocation ? (
                  <DashboardAddListingMapPreview
                    location={selectedLocation}
                    deliveryRadiusKm={formState.deliveryRadius}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 border-background/90 bg-background/70 p-6 text-center">
                      <MapPinned className="h-12 w-12 text-primary" />
                      <p className="mt-4 text-sm font-semibold text-foreground">
                        {selectedCategory
                          ? selectedCategory.title
                          : 'Select category'}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {formState.address.trim() ||
                          'Address preview will appear here'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 rounded bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground shadow-sm">
                  Live Preview
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {formError ? (
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-5 text-sm font-medium text-[#7a120c] shadow-sm">
          {formError}
        </div>
      ) : null}

      {formNotice ? (
        <div className="rounded-xl border border-[#c1ecd4] bg-[#f4fbf7] p-5 text-sm font-medium text-[#0a3925] shadow-sm">
          {formNotice}
        </div>
      ) : null}

      <div className="border-t border-border pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={isEditing ? handleDeleteListing : resetForm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {isDeleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {isEditing ? 'Delete Listing' : 'Discard Draft'}
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting || isDeleting}
              className="rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
              {isSavingDraft ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || isSavingDraft || isDeleting || !phoneVerified
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Verification
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
