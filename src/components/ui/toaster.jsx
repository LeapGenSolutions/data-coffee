import React, { useEffect, useState } from 'react';

let toastQueue = [];
let setToasts = null;

export function toast({ title, description, variant = "default" }) {
  const id = Date.now();
  const newToast = { id, title, description, variant };
  
  toastQueue.push(newToast);
  
  if (setToasts) {
    setToasts([...toastQueue]);
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    if (setToasts) {
      setToasts([...toastQueue]);
    }
  }, 5000);
}

export function Toaster() {
  const [toasts, setToastsInternal] = useState([]);
  
  useEffect(() => {
    setToasts = setToastsInternal;
    setToastsInternal([...toastQueue]);
    
    return () => {
      setToasts = null;
    };
  }, []);
  
  const removeToast = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    setToastsInternal([...toastQueue]);
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            toast.variant === 'destructive' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
          }`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}