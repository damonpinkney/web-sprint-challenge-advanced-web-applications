import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import Spinner from './Spinner';

test('renders spinner when `on` prop is true', () => {
  render(<Spinner on={true} />);
  expect(screen.getByText(/please wait/i)).toBeInTheDocument();
});

test('does not render spinner when `on` prop is false', () => {
  render(<Spinner on={false} />);
  expect(screen.queryByText(/please wait/i)).not.toBeInTheDocument();
});
