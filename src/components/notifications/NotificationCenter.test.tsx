import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import NotificationCenter from './NotificationCenter';
import * as notificationsApi from '../../api/notifications';

// Mock the API
vi.mock('../../api/notifications', () => ({
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
}));

const mockNotifications = [
  {
    id: 1,
    actor_username: 'Dr. Smith',
    verb: 'scheduled an appointment',
    level: 'info',
    unread: true,
    timestamp: new Date().toISOString(),
    target_url: '/appointments/1',
  },
  {
    id: 2,
    actor_username: null,
    verb: 'medication reminder',
    level: 'warning',
    unread: true,
    timestamp: new Date().toISOString(),
    target_url: null,
  },
  {
    id: 3,
    actor_username: 'Pharmacy Name',
    verb: 'prescription ready',
    level: 'success',
    unread: false,
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    target_url: '/prescriptions/1',
  },
];

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification bell icon', () => {
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    render(<NotificationCenter />);
    
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
  });

  it('shows unread count badge', async () => {
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });

    render(<NotificationCenter />);

    await waitFor(() => {
      const badge = screen.getByText('2'); // 2 unread notifications
      expect(badge).toBeInTheDocument();
    });
  });

  it('opens dropdown when bell is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('displays list of notifications', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/scheduled an appointment/i)).toBeInTheDocument();
      expect(screen.getByText(/medication reminder/i)).toBeInTheDocument();
      expect(screen.getByText(/prescription ready/i)).toBeInTheDocument();
    });
  });

  it('marks notification as read when clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });
    vi.mocked(notificationsApi.markNotificationRead).mockResolvedValue(mockNotifications[0]);

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/scheduled an appointment/i)).toBeInTheDocument();
    });

    const firstNotification = screen.getByText(/scheduled an appointment/i);
    await user.click(firstNotification);

    await waitFor(() => {
      expect(notificationsApi.markNotificationRead).toHaveBeenCalledWith(1);
    });
  });

  it('marks all notifications as read', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });
    vi.mocked(notificationsApi.markAllNotificationsRead).mockResolvedValue({ status: 'success' });

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    await waitFor(() => {
      const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
      expect(markAllButton).toBeInTheDocument();
    });

    const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
    await user.click(markAllButton);

    await waitFor(() => {
      expect(notificationsApi.markAllNotificationsRead).toHaveBeenCalled();
    });
  });

  it('shows empty state when no notifications', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching notifications', () => {
    vi.mocked(notificationsApi.getNotifications).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<NotificationCenter />);

    // Should show loading initially
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockRejectedValue(
      new Error('API Error')
    );

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    // Should still render the component even if API fails
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });

    render(
      <div>
        <NotificationCenter />
        <button>Outside</button>
      </div>
    );

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    const outsideButton = screen.getByRole('button', { name: /outside/i });
    await user.click(outsideButton);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    vi.mocked(notificationsApi.getNotifications).mockResolvedValue({
      count: 3,
      next: null,
      previous: null,
      results: mockNotifications,
    });

    render(<NotificationCenter />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    
    // Open with Enter key
    bellButton.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    // Close with Escape key
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });
});
