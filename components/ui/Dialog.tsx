"use client";

import {
  DialogPanel,
  DialogTitle,
  Dialog as HeadlessDialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { Fragment, useState } from "react";

interface DialogProps {
  children: ReactNode;
  trigger: ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  children,
  trigger,
  title,
  description,
  open: controlledOpen,
  onOpenChange,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="contents"
      >
        {trigger}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative w-full max-w-2xl transform overflow-y-auto rounded-lg bg-white p-6 shadow-xl transition-all max-h-[85vh]">
                  {title && (
                    <DialogTitle className="text-xl font-semibold mb-2">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                  )}

                  <div>{children}</div>

                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100"
                    onClick={() => setIsOpen(false)}
                    aria-label="閉じる"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
    </>
  );
}
