import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TermsDialogState {
  isOpen: boolean;
  hasAccepted: boolean;
  setIsOpen: (open: boolean) => void;
  acceptTerms: () => void;
  resetTerms: () => void;
  showOnLogin: () => void;
}

export const useTermsDialog = create<TermsDialogState>()(
  persist(
    (set) => ({
      isOpen: false,
      hasAccepted: false,
      setIsOpen: (open) => set({ isOpen: open }),
      acceptTerms: () => set({ hasAccepted: true, isOpen: false }),
      resetTerms: () => set({ hasAccepted: false, isOpen: true }),
      showOnLogin: () => set({ isOpen: true, hasAccepted: false }),
    }),
    {
      name: "terms-dialog-storage",
    }
  )
);
