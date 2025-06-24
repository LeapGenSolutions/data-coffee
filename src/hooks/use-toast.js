import { useState, useCallback } from "react";

const toastState = {
  toasts: [],
  listeners: []
};

let toastId = 0;

function genId() {
  return (++toastId).toString();
}

function addToast(toast) {
  const id = genId();
  const newToast = { ...toast, id };
  toastState.toasts.push(newToast);
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
  
  return id;
}

function removeToast(id) {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id);
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));
}

function toast({ title, description, variant = "default" }) {
  return addToast({ title, description, variant });
}

export function useToast() {
  const [toasts, setToasts] = useState(toastState.toasts);

  // Subscribe to toast changes
  useState(() => {
    const listener = (newToasts) => setToasts(newToasts);
    toastState.listeners.push(listener);
    
    return () => {
      toastState.listeners = toastState.listeners.filter(l => l !== listener);
    };
  });

  const dismiss = useCallback((toastId) => {
    removeToast(toastId);
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
}