import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
}

let toastCount = 0;

function generateId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(state: ToastState) {
  memoryState = state;
  listeners.forEach((listener) => listener(state));
}

export function toast({
  title,
  description,
  variant = 'default',
}: Omit<Toast, 'id'>) {
  const id = generateId();
  const newToast: Toast = { id, title, description, variant };

  dispatch({
    toasts: [...memoryState.toasts, newToast],
  });

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    dispatch({
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    });
  }, 5000);

  return id;
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useState(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  const dismiss = useCallback((toastId: string) => {
    dispatch({
      toasts: memoryState.toasts.filter((t) => t.id !== toastId),
    });
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
}
