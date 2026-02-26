import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

test('renders Input with placeholder', () => {
  render(<Input placeholder="Type here" />);
  expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
}); 