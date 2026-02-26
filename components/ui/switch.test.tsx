import React from 'react';
import { render } from '@testing-library/react';
import { Switch } from './switch';

test('renders Switch', () => {
  const { container } = render(<Switch />);
  expect(container.firstChild).toBeInTheDocument();
}); 