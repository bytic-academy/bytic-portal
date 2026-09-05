import { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { router } from './router';

function AppRouter() {
  const { user, isLoading, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    router.invalidate();
  }, [user, isLoading, isAdmin]);

  return (
    <RouterProvider
      router={router}
      context={{
        auth: { user, isLoading, isAdmin },
        queryClient,
      }}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
