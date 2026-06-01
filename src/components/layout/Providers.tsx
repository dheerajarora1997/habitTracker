'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useLazyCheckMeQuery } from '@/store/apiSlice';
import { setCredentials, clearCredentials, setLoading } from '@/store/authSlice';

import { ThemeProvider } from './ThemeProvider';

function SessionLoader({ children }: { children: React.ReactNode }) {
  const [triggerCheckMe] = useLazyCheckMeQuery();

  useEffect(() => {
    async function initSession() {
      try {
        const response = await triggerCheckMe().unwrap();
        if (response?.success && response?.user) {
          store.dispatch(
            setCredentials({
              user: response.user,
            })
          );
        } else {
          store.dispatch(clearCredentials());
        }
      } catch (err) {
        // No session active, clear state silently
        store.dispatch(clearCredentials());
      } finally {
        store.dispatch(setLoading(false));
      }
    }

    initSession();
  }, [triggerCheckMe]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SessionLoader>{children}</SessionLoader>
      </ThemeProvider>
    </Provider>
  );
}
