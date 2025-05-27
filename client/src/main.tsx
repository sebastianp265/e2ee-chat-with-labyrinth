import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { bytesSerializerProvider } from '@sebastianp265/safe-server-side-storage-client';
import { base64StringToBytes, bytesToBase64String } from '@/lib/utils.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/router.tsx';

const queryClient = new QueryClient();

bytesSerializerProvider.bytesSerializer = {
    serialize: bytesToBase64String,
    deserialize: base64StringToBytes,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>,
);
