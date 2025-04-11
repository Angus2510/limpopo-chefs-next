import { create } from "zustand";

interface TermsDialogState {
  isOpen: boolean;
  hasAccepted: boolean;
  setIsOpen: (open: boolean) => void;
  acceptTerms: () => void;
  resetTerms: () => void;
}

export const useTermsDialog = create<TermsDialogState>((set) => ({
  isOpen: true,
  hasAccepted: false,
  setIsOpen: (open) => set({ isOpen: open }),
  acceptTerms: () => set({ hasAccepted: true, isOpen: false }),
  resetTerms: () => set({ hasAccepted: false, isOpen: true }),
}));
