import toast, { Toaster } from 'react-hot-toast';

// Toast helper functions
export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            duration: 3000,
            position: 'bottom-right',
            style: {
                background: '#10b981',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
            },
        });
    },

    error: (message: string) => {
        toast.error(message, {
            duration: 4000,
            position: 'bottom-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
            },
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            position: 'bottom-right',
            style: {
                background: '#3b82f6',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading,
                success: messages.success,
                error: messages.error,
            },
            {
                position: 'bottom-right',
                style: {
                    padding: '16px',
                    borderRadius: '8px',
                },
            }
        );
    },
};

// Export Toaster component for layout
export { Toaster };
