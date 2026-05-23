import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  Star
} from 'lucide-react';

export type CategoryTab = {
  label: string;
  active?: boolean;
};

export type CategoryFilter = {
  label: string;
  value: string;
  options?: string[];
};

export type CategoryProduct = {
  id: string;
  href: string;
  title: string;
  rating: string;
  reviews: string;
  location: string;
  price: string;
  image: string;
  alt: string;
  favorite?: boolean;
};

export type CategoryShellIcon = LucideIcon;

export const categoryIcons = {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  SlidersHorizontal,
  Star
};
