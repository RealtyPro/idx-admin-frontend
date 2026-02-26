import React from 'react';
import { render } from '@testing-library/react';
import { Select } from './select';

test('renders Select', () => {
  const { container } = render(<Select />);
  expect(container.firstChild).toBeInTheDocument();
}); 