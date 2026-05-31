'use client';

import { cn } from '@/lib/utils';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import * as React from 'react';

const Dialog = BaseDialog.Root;
const DialogTrigger = BaseDialog.Trigger;
const DialogPortal = BaseDialog.Portal;
const DialogClose = BaseDialog.Close;

const DialogBackdrop = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseDialog.Backdrop>
>(function DialogBackdrop({ className, ...props }, ref) {
  return (
    <BaseDialog.Backdrop
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
        className
      )}
      {...props}
    />
  );
});

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseDialog.Popup>
>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <BaseDialog.Popup
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.22)] outline-none transition-[opacity,transform] duration-150 data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]',
          className
        )}
        {...props}>
        {children}
      </BaseDialog.Popup>
    </DialogPortal>
  );
});

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-wrap items-center justify-end gap-3',
        className
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof BaseDialog.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <BaseDialog.Title
      ref={ref}
      className={cn(
        'text-2xl font-semibold tracking-[-0.04em] text-primary',
        className
      )}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof BaseDialog.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={cn('text-sm  text-muted-foreground', className)}
      {...props}
    />
  );
});

function DialogDismissButton({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Close>) {
  return (
    <BaseDialog.Close
      className={cn(
        'absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
      {...props}>
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </BaseDialog.Close>
  );
}

export {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger
};
