import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('renders Button with children', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
}); 