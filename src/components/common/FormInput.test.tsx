import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import userEvent from '@testing-library/user-event';
import FormInput from './FormInput';

describe('FormInput', () => {
  it('renders input with label', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
        error="Email is required"
      />
    );

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('applies error styling when error exists', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
        error="Email is required"
      />
    );

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('shows required indicator when required', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
      />
    );

    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.type(input, 'test@example.com');

    expect(input.value).toBe('test@example.com');
  });

  it('can be disabled', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
        disabled
      />
    );

    const input = screen.getByLabelText(/email/i);
    expect(input).toBeDisabled();
  });

  it('shows helper text when provided', () => {
    render(
      <FormInput
        label="Password"
        name="password"
        type="password"
        helperText="Must be at least 8 characters"
      />
    );

    expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('supports different input types', () => {
    const { rerender } = render(
      <FormInput
        label="Email"
        name="email"
        type="email"
      />
    );

    let input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('type', 'email');

    rerender(
      <FormInput
        label="Password"
        name="password"
        type="password"
      />
    );

    input = screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('has proper accessibility attributes', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
        error="Invalid email"
        helperText="Enter a valid email address"
      />
    );

    const input = screen.getByLabelText(/email/i);
    
    // Should have aria-invalid when there's an error
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    // Should have aria-describedby linking to error or helper text
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('focuses input when label is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <FormInput
        label="Email"
        name="email"
        type="email"
      />
    );

    const label = screen.getByText('Email');
    await user.click(label);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveFocus();
  });
});
