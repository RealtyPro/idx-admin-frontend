import React from 'react';
import { render } from '@testing-library/react';
import { Tabs } from './tabs';

test('renders Tabs', () => {
  const { container } = render(<Tabs />);
  expect(container.firstChild).toBeInTheDocument();
}); 