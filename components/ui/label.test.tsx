import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

test('renders Label with text', () => {
  render(<Label htmlFor="test-input">Test Label</Label>);
  expect(screen.getByText('Test Label')).toBeInTheDocument();
}); 