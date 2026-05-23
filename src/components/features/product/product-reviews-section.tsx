'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  useCreateEquipmentReviewMutation,
  useUpdateEquipmentReviewMutation
} from '@/hooks/use-equipment';
import type {
  EquipmentDetails,
  EquipmentReviewImageSummary,
  EquipmentReviewSummary
} from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import {
  ChevronDown,
  Loader2,
  MessageSquarePlus,
  Star,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type LocalPhotoPreview = {
  id: string;
  url: string;
  file: File;
};

function formatLongDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function buildEmptyForm() {
  return {
    rating: 0,
    title: '',
    description: ''
  };
}

function buildFormFromReview(review: EquipmentReviewSummary | null) {
  if (!review) {
    return buildEmptyForm();
  }

  return {
    rating: review.rating,
    title: review.title,
    description: review.description
  };
}

function buildReviewPreview(description: string, maxWords = 200) {
  const words = description.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return {
      text: description.trim(),
      isTruncated: false
    };
  }

  return {
    text: `${words.slice(0, maxWords).join(' ')}...`,
    isTruncated: true
  };
}

function RatingStars({
  rating,
  onChange,
  interactive = false,
  size = 'md'
}: {
  rating: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-9 w-9' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;

        if (!interactive || !onChange) {
          return (
            <Star
              key={star}
              className={[
                sizeClass,
                filled ? 'fill-[#ffb800] text-[#ffb800]' : 'text-[#c6cfc8]'
              ].join(' ')}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rounded-sm p-0.5 transition-transform hover:scale-105"
            aria-label={`Rate ${star} out of 5`}>
            <Star
              className={[
                sizeClass,
                filled ? 'fill-[#ffb800] text-[#ffb800]' : 'text-[#c6cfc8]'
              ].join(' ')}
            />
          </button>
        );
      })}
    </div>
  );
}

function ExistingPhotoChip({
  photo,
  onRemove
}: {
  photo: EquipmentReviewImageSummary;
  onRemove?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#c1c8c2] bg-white">
      <div className="relative h-28 w-full">
        <Image
          loading={'lazy'}
          src={photo.url}
          alt="Review photo"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm"
          aria-label="Remove existing photo">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function NewPhotoChip({
  preview,
  onRemove
}: {
  preview: LocalPhotoPreview;
  onRemove: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#c1c8c2] bg-white">
      <div className="relative h-28 w-full">
        <Image
          loading={'lazy'}
          src={preview.url}
          alt="New review upload"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm"
        aria-label="Remove uploaded photo">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ReviewCard({ review }: { review: EquipmentReviewSummary }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = useMemo(
    () => buildReviewPreview(review.description, 200),
    [review.description]
  );

  return (
    <article className="flex w-90 shrink-0 flex-col rounded border border-[#c1c8c2] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8e5] text-sm font-semibold text-primary">
          {review.renter.fullName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-[#1a1c1a]">
            {review.renter.fullName}
          </p>
          <RatingStars
            rating={review.rating}
            size="sm"
          />
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-primary">
        {review.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[#414844]">
        {isExpanded ? review.description : preview.text}
      </p>

      {preview.isTruncated ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-3 inline-flex items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-[#274e3d]"
          aria-expanded={isExpanded}>
          {isExpanded ? 'Show less' : 'Read more'}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      ) : null}

      {review.images.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {review.images.slice(0, 3).map((image) => (
            <div
              key={image.id}
              className="relative h-20 overflow-hidden rounded border border-[#c1c8c2] bg-[#f3f4f1]">
              <Image
                loading={'lazy'}
                src={image.url}
                alt={`${review.title} review photo`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-xs text-[#717973]">
          {formatLongDate(review.updatedAt)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c5f60]">
          Verified renter
        </span>
      </div>
    </article>
  );
}

export function ProductReviewsSection({
  product
}: {
  product: EquipmentDetails;
}) {
  const createReviewMutation = useCreateEquipmentReviewMutation();
  const updateReviewMutation = useUpdateEquipmentReviewMutation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(
    buildFormFromReview(product.viewerReviewState.review)
  );
  const [retainedPhotoIds, setRetainedPhotoIds] = useState<string[]>(
    product.viewerReviewState.review?.images.map((image) => image.id) ?? []
  );
  const [newPhotos, setNewPhotos] = useState<LocalPhotoPreview[]>([]);
  const latestNewPhotosRef = useRef<LocalPhotoPreview[]>([]);

  useEffect(() => {
    setForm(buildFormFromReview(product.viewerReviewState.review));
    setRetainedPhotoIds(
      product.viewerReviewState.review?.images.map((image) => image.id) ?? []
    );
    setErrorMessage(null);
  }, [product.viewerReviewState.review]);

  useEffect(() => {
    latestNewPhotosRef.current = newPhotos;
  }, [newPhotos]);

  useEffect(() => {
    return () => {
      for (const photo of latestNewPhotosRef.current) {
        URL.revokeObjectURL(photo.url);
      }
    };
  }, []);

  const existingReview = product.viewerReviewState.review;
  const viewerState = product.viewerReviewState;
  const retainedExistingPhotos = useMemo(
    () =>
      (existingReview?.images ?? []).filter((image) =>
        retainedPhotoIds.includes(image.id)
      ),
    [existingReview?.images, retainedPhotoIds]
  );
  const totalSelectedPhotos = retainedExistingPhotos.length + newPhotos.length;
  const isMutating =
    createReviewMutation.isPending || updateReviewMutation.isPending;
  const reviewGalleryPhotos = useMemo(
    () =>
      product.reviews
        .flatMap((review) =>
          review.images.map((image) => ({
            id: image.id,
            url: image.url,
            title: review.title
          }))
        )
        .slice(0, 4),
    [product.reviews]
  );
  const canOpenModal =
    viewerState.isLoggedIn &&
    viewerState.canReview &&
    (viewerState.code === 'CAN_CREATE' || viewerState.code === 'CAN_UPDATE');

  function resetModalState() {
    setForm(buildFormFromReview(existingReview));
    setRetainedPhotoIds(existingReview?.images.map((image) => image.id) ?? []);
    setNewPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url));
      return [];
    });
    setErrorMessage(null);
  }

  function handleModalOpenChange(open: boolean) {
    setIsModalOpen(open);

    if (!open) {
      resetModalState();
    }
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const remainingSlots = Math.max(0, 5 - totalSelectedPhotos);
    const nextFiles = Array.from(fileList).slice(0, remainingSlots);
    const nextPreviews = nextFiles.map((file) => ({
      id: `${file.name}_${file.lastModified}_${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      file
    }));

    setErrorMessage(null);
    setNewPhotos((current) => [...current, ...nextPreviews]);
  }

  function removeNewPhoto(id: string) {
    setNewPhotos((current) => {
      const target = current.find((photo) => photo.id === id);

      if (target) {
        URL.revokeObjectURL(target.url);
      }

      return current.filter((photo) => photo.id !== id);
    });
    setErrorMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setErrorMessage(null);

    if (form.rating < 1 || form.rating > 5) {
      setErrorMessage('Choose a rating between 1 and 5 stars.');
      return;
    }

    if (form.title.trim().length < 2) {
      setErrorMessage('Enter a review title.');
      return;
    }

    if (form.description.trim().length < 10) {
      setErrorMessage('Enter at least 10 characters in your review.');
      return;
    }

    if (form.description.trim().length > 2000) {
      setErrorMessage('Review description must be 2000 characters or less.');
      return;
    }

    if (totalSelectedPhotos > 5) {
      setErrorMessage('Upload no more than 5 photos.');
      return;
    }

    try {
      const payload = {
        rating: form.rating,
        title: form.title.trim(),
        description: form.description.trim(),
        photos: newPhotos.map((photo) => photo.file)
      };

      if (existingReview) {
        await updateReviewMutation.mutateAsync({
          id: product.id,
          input: {
            ...payload,
            retainedPhotoIds
          }
        });
        setFeedback('Your review was updated successfully.');
      } else {
        await createReviewMutation.mutateAsync({
          id: product.id,
          input: payload
        });
        setFeedback('Your review was submitted successfully.');
      }

      handleModalOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to save your review right now.'
      );
    }
  }

  return (
    <section className="bg-[#f3f4f1] py-16">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#c1c8c2] pb-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-10">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-primary">
                  Customer Reviews
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <RatingStars
                    rating={Math.round(product.averageRating ?? 0)}
                  />
                  <span className="text-xl font-semibold text-primary">
                    {product.averageRating?.toFixed(1) ?? '0.0'} out of 5
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#5c5f60]">
                  {product.reviewCount} global rating
                  {product.reviewCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {canOpenModal ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded bg-[#1b4332] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all hover:opacity-90">
                <MessageSquarePlus className="h-4 w-4" />
                {existingReview ? 'Update Your Review' : 'Add Your Review'}
              </button>
            ) : null}
          </div>

          {feedback ? (
            <div className="mt-6 rounded-lg border border-[#c1c8c2] bg-white px-4 py-3 text-sm font-medium text-primary">
              {feedback}
            </div>
          ) : null}

          {viewerState.isLoggedIn &&
          (viewerState.code === 'ROLE_NOT_ALLOWED' ||
            viewerState.code === 'BOOKING_NOT_COMPLETED') ? (
            <div className="mt-6 rounded-lg border border-[#c1c8c2] bg-white px-5 py-4 text-sm text-[#5c5f60]">
              {viewerState.message}
            </div>
          ) : null}
        </div>

        <div className="group relative mt-8">
          <div className="no-scrollbar flex gap-8 overflow-x-auto pb-4">
            {product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                />
              ))
            ) : (
              <div className="w-full rounded border border-dashed border-[#c1c8c2] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
                No reviews yet. Completed renters will be able to share the
                first review here.
              </div>
            )}
          </div>
        </div>

        {reviewGalleryPhotos.length > 0 ? (
          <div className="mt-8 border-t border-[#c1c8c2] pt-6">
            <div className="flex flex-wrap items-center gap-3">
              {reviewGalleryPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative h-16 w-16 overflow-hidden rounded border border-[#c1c8c2] bg-white">
                  <Image
                    src={photo.url}
                    loading={'lazy'}
                    alt={photo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
              {product.reviews.flatMap((review) => review.images).length > 4 ? (
                <div className="flex h-16 w-16 items-center justify-center rounded border border-[#c1c8c2] bg-[#eeeeeb] text-sm font-bold text-primary">
                  +
                  {product.reviews.flatMap((review) => review.images).length -
                    4}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="text-sm font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:underline">
            View All {product.reviewCount} Review
            {product.reviewCount === 1 ? '' : 's'}
          </button>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}>
        <DialogContent className="w-[min(92vw,32rem)] overflow-hidden rounded-xl border border-[#c1c8c2] bg-white p-0 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="relative">
            <div className="border-b border-[#c1c8c2] px-6 py-4 sm:px-8">
              <DialogDismissButton />
              <DialogHeader className="pr-12">
                <DialogTitle className="text-2xl text-primary">
                  {existingReview
                    ? 'Update your experience'
                    : 'Rate your experience'}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#5c5f60]">
                  Share how the equipment performed and how the rental
                  experience felt.
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6 px-6 py-6 sm:px-8">
                <div className="flex items-center gap-4 rounded-lg border border-[#c1c8c2]/50 bg-[#f3f4f1] p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#dadad7]">
                    <Image
                      src={product.images[0]?.url ?? product.category.imageUrl}
                      alt={product.title}
                      fill
                      loading={'lazy'}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5c5f60]">
                      Reviewing
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {product.title}
                    </p>
                  </div>
                </div>

                {errorMessage ? (
                  <div className="rounded-lg border border-[#ffdad6] bg-[#fff5f3] px-4 py-3 text-sm font-medium text-[#ba1a1a]">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="flex flex-col items-center gap-3 py-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5c5f60]">
                    Overall quality
                  </p>
                  <RatingStars
                    rating={form.rating}
                    onChange={(rating) =>
                      setForm((current) => ({ ...current, rating }))
                    }
                    interactive
                    size="lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5c5f60]">
                    Review title
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    maxLength={120}
                    className="mt-3 h-11 w-full rounded-lg border border-[#c1c8c2] bg-white px-4 text-sm text-[#1a1c1a] outline-none transition-colors placeholder:text-[#8c938e] focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]/20"
                    placeholder="Summarize the machine and owner experience"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5c5f60]">
                    Your review
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value
                      }))
                    }
                    maxLength={2000}
                    rows={5}
                    className="mt-3 w-full resize-none rounded-lg border border-[#c1c8c2] bg-white px-4 py-3 text-sm leading-7 text-[#1a1c1a] outline-none transition-colors placeholder:text-[#8c938e] focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]/20"
                    placeholder="Tell others about the condition of the equipment and the owner communication..."
                  />
                  <p className="mt-2 text-right text-xs text-[#717973]">
                    {form.description.trim().length}/2000
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5c5f60]">
                      Attach photos
                    </label>
                    <span className="text-xs text-[#717973]">
                      Optional, up to 5
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {retainedExistingPhotos.map((photo) => (
                      <ExistingPhotoChip
                        key={photo.id}
                        photo={photo}
                        onRemove={() =>
                          setRetainedPhotoIds((current) =>
                            current.filter((photoId) => photoId !== photo.id)
                          )
                        }
                      />
                    ))}
                    {newPhotos.map((photo) => (
                      <NewPhotoChip
                        key={photo.id}
                        preview={photo}
                        onRemove={() => removeNewPhoto(photo.id)}
                      />
                    ))}
                    {totalSelectedPhotos < 5 ? (
                      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c1c8c2] bg-[#f3f4f1] px-4 py-5 text-center transition-colors hover:bg-[#eeeeeb]">
                        <Upload className="h-7 w-7 text-[#5c5f60]" />
                        <span className="mt-3 text-sm font-semibold text-primary">
                          Show the machinery in action
                        </span>
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#717973]">
                          PNG, JPG or WEBP
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) =>
                            handleFilesSelected(event.target.files)
                          }
                          className="hidden"
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 bg-[#f3f4f1] px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={() => handleModalOpenChange(false)}
                  className="rounded-lg border border-[#c1c8c2] px-5 py-2.5 text-sm font-semibold text-[#5c5f60] transition-colors hover:bg-[#e8e8e5]">
                  Cancel
                </button>
                <DialogFooter className="mt-0 gap-0">
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1b4332] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
                    {isMutating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {existingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </DialogFooter>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
