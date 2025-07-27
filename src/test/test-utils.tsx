import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthProvider';
import ErrorBoundary from '../components/ErrorBoundary';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  account_type: 'individual' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  verified: false,
  ...overrides,
});

export const createMockExpertApplication = (overrides = {}) => ({
  id: 'test-application-id',
  user_id: 'test-user-id',
  name: 'Test Expert',
  email: 'expert@example.com',
  phone: '010-1234-5678',
  bio: 'Test bio',
  specialties: ['React', 'TypeScript'],
  rate: 50000,
  status: 'pending' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockPayment = (overrides = {}) => ({
  id: 'test-payment-id',
  user_id: 'test-user-id',
  amount: 10000,
  status: 'completed' as const,
  payment_method: 'card',
  type: 'certificate',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});