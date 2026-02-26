import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

test('renders Skeleton', () => {
  const { container } = render(<Skeleton />);
  expect(container.firstChild).toBeInTheDocument();
}); 