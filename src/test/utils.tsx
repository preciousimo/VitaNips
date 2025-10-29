import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock AuthContext for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock API responses
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'patient' as const,
};

export const mockNotification = {
  id: 1,
  notification_type: 'APPOINTMENT_REMINDER',
  message: 'You have an appointment tomorrow',
  is_read: false,
  created_at: new Date().toISOString(),
};

export const mockAppointment = {
  id: 1,
  doctor: {
    id: 1,
    user: {
      first_name: 'Dr. John',
      last_name: 'Doe',
    },
    specialty: 'Cardiology',
  },
  appointment_date: new Date().toISOString(),
  appointment_time: '10:00:00',
  status: 'scheduled' as const,
  reason: 'Regular checkup',
};
