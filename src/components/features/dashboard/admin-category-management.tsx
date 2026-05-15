"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FolderTree,
  ImagePlus,
  PencilLine,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/hooks/use-category";
import type { Category } from "@/lib/category";
import { ApiError } from "@/lib/http";

type CategoryFormState = {
  title: string;
  description: string;
  image: File | null;
};

const initialFormState: CategoryFormState = {
  title: "",
  description: "",
  image: null,
};

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Updated recently";
  }

  const diffMs = timestamp - Date.now();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absoluteDiff = Math.abs(diffMs);

  if (absoluteDiff < hourMs) {
    return rtf.format(Math.round(diffMs / minuteMs), "minute");
  }

  if (absoluteDiff < dayMs) {
    return rtf.format(Math.round(diffMs / hourMs), "hour");
  }

  return rtf.format(Math.round(diffMs / dayMs), "day");
}

function CategoriesSkeleton() {
  return (
    <section className='space-y-8 animate-pulse'>
      <div>
        <div className='h-3 w-28 rounded bg-muted' />
        <div className='mt-3 h-10 w-72 rounded bg-muted' />
        <div className='mt-3 h-5 max-w-3xl rounded bg-muted' />
      </div>

      <div className='grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'>
        <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
          <div className='h-7 w-44 rounded bg-muted' />
          <div className='mt-6 space-y-4'>
            {[0, 1, 2].map((item) => (
              <div key={item} className='space-y-2'>
                <div className='h-4 w-20 rounded bg-muted' />
                <div className='h-11 w-full rounded bg-muted' />
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
          <div className='h-7 w-52 rounded bg-muted' />
          <div className='mt-6 grid gap-4 md:grid-cols-2'>
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className='rounded-xl border border-border bg-muted/20 p-4'
              >
                <div className='h-40 rounded-lg bg-muted' />
                <div className='mt-4 h-5 w-32 rounded bg-muted' />
                <div className='mt-2 h-4 w-full rounded bg-muted' />
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function CategoriesErrorState({ message }: { message: string }) {
  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
          Admin Workspace
        </p>
        <h1 className='mt-3 text-4xl font-extrabold tracking-[-0.04em] text-primary'>
          Category Management
        </h1>
      </div>
      <div className='rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm'>
        <div className='flex items-center gap-3 text-[#7a120c]'>
          <AlertTriangle className='h-5 w-5' />
          <h2 className='text-xl font-semibold tracking-[-0.03em]'>
            We couldn&apos;t load categories
          </h2>
        </div>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]'>
          {message}
        </p>
      </div>
    </section>
  );
}

export function AdminCategoryManagement() {
  const categoriesQuery = useCategoriesQuery();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formState, setFormState] =
    useState<CategoryFormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const previewUrl = useMemo(() => {
    if (!formState.image) {
      return null;
    }

    return URL.createObjectURL(formState.image);
  }, [formState.image]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (categoriesQuery.isPending) {
    return <CategoriesSkeleton />;
  }

  if (categoriesQuery.isError) {
    return (
      <CategoriesErrorState
        message={
          categoriesQuery.error instanceof ApiError
            ? categoriesQuery.error.message
            : "Try refreshing this page in a moment."
        }
      />
    );
  }

  const categories = [...categoriesQuery.data].sort((left, right) => {
    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
  const isEditing = editingCategory !== null;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function resetForm() {
    setEditingCategory(null);
    setFormError(null);
    setFormState(initialFormState);
  }

  function validateForm() {
    if (formState.title.trim().length < 2) {
      return "Enter a valid title.";
    }

    if (formState.description.trim().length < 10) {
      return "Enter a valid description.";
    }

    if (!isEditing && !formState.image) {
      return "Category image is required.";
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    try {
      if (isEditing && editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          title: formState.title.trim(),
          description: formState.description.trim(),
          image: formState.image,
        });
      } else if (formState.image) {
        await createMutation.mutateAsync({
          title: formState.title.trim(),
          description: formState.description.trim(),
          image: formState.image,
        });
      }

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Unable to save category.",
      );
    }
  }

  async function handleDelete(category: Category) {
    if (deleteMutation.isPending) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(category.id);

      if (editingCategory?.id === category.id) {
        resetForm();
      }
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Unable to delete category.",
      );
    }
  }

  return (
    <section className='space-y-8 pb-10'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
          Admin Workspace
        </p>
        <h1 className='mt-3 text-4xl font-extrabold tracking-[-0.04em] text-primary'>
          Category Management
        </h1>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground'>
          Review recent categories and manage the marketplace taxonomy from one
          admin workspace.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'>
        <section className='rounded-xl border border-border bg-zinc-50 p-6 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-semibold tracking-[-0.03em] text-foreground'>
                {isEditing ? "Edit Category" : "Create Category"}
              </h2>
              <p className='mt-2 text-sm text-muted-foreground'>
                {isEditing
                  ? "Update category copy and optionally replace the image."
                  : "Add a new category for owners to use when publishing equipment."}
              </p>
            </div>
            <div className='flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
              {isEditing ? (
                <PencilLine className='h-5 w-5' />
              ) : (
                <Plus className='h-5 w-5' />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-foreground'>
                Title
              </label>
              <input
                type='text'
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className='w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary'
                placeholder='Excavators'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-foreground'>
                Description
              </label>
              <textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={5}
                className='w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary'
                placeholder='Heavy digging equipment for excavation and earthmoving work.'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-foreground'>
                {isEditing ? "Replace Image (Optional)" : "Category Image"}
              </label>
              <label className='flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground'>
                <ImagePlus className='h-4 w-4 text-primary' />
                <span className='flex-1 truncate'>
                  {formState.image
                    ? formState.image.name
                    : "Choose an image file"}
                </span>
                <span className='rounded bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary'>
                  Browse
                </span>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      image: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>
              {previewUrl ? (
                <div className='relative mt-4 overflow-hidden rounded-xl border border-border bg-muted/20'>
                  <div className='absolute right-3 top-3 z-10'>
                    <button
                      type='button'
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          image: null,
                        }))
                      }
                      className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-destructive'
                      aria-label='Remove selected image'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                  <div className='relative h-48 w-full'>
                    <Image
                      src={previewUrl}
                      alt='Selected category preview'
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {formError ? (
              <p className='text-sm font-medium text-destructive'>
                {formError}
              </p>
            ) : null}

            <div className='flex flex-col gap-3 sm:flex-row'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isEditing ? (
                  <Save className='h-4 w-4' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Category"}
              </button>
              {isEditing ? (
                <button
                  type='button'
                  onClick={resetForm}
                  className='inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted'
                >
                  <X className='h-4 w-4' />
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
          <div className='flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-2xl font-semibold tracking-[-0.03em] text-foreground'>
                Recent Categories
              </h2>
              <p className='mt-2 text-sm text-muted-foreground'>
                {categories.length} categories currently available for listings.
              </p>
            </div>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
              <FolderTree className='h-4 w-4' />
              Admin taxonomy
            </div>
          </div>

          {categories.length > 0 ? (
            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              {categories.map((category) => {
                const isDeleting = deleteMutation.isPending;
                const isCurrentEdit = editingCategory?.id === category.id;

                return (
                  <article
                    key={category.id}
                    className='overflow-hidden rounded-xl border border-border bg-muted/10'
                  >
                    <div className='relative h-44 bg-muted'>
                      <Image
                        src={category.imageUrl}
                        alt={category.title}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='p-5'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <h3 className='text-lg font-semibold tracking-[-0.02em] text-foreground'>
                            {category.title}
                          </h3>
                          <p className='mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
                            Added {formatRelativeDate(category.createdAt)}
                          </p>
                        </div>
                        {isCurrentEdit ? (
                          <span className='rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary'>
                            Editing
                          </span>
                        ) : null}
                      </div>
                      <p className='mt-3 text-sm leading-7 text-muted-foreground'>
                        {category.description.substring(0, 70)} ...
                      </p>
                      <div className='mt-5 flex gap-3'>
                        <button
                          type='button'
                          onClick={() => {
                            setFormError(null);
                            setEditingCategory(category);
                            setFormState({
                              title: category.title,
                              description: category.description,
                              image: null,
                            });
                          }}
                          className='inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
                        >
                          <PencilLine className='h-4 w-4' />
                          Edit
                        </button>
                        <button
                          type='button'
                          disabled={isDeleting}
                          onClick={() => handleDelete(category)}
                          className='inline-flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          <Trash2 className='h-4 w-4' />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className='mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <FolderTree className='h-5 w-5' />
              </div>
              <h3 className='mt-4 text-xl font-semibold tracking-[-0.03em] text-foreground'>
                No categories created yet
              </h3>
              <p className='mt-3 text-sm leading-7 text-muted-foreground'>
                Create the first category so owners can assign their listings to
                the right equipment type.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
