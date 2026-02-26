import React from 'react';
import { render } from '@testing-library/react';
import { Slider } from './slider';

test('renders Slider', () => {
  const { container } = render(<Slider />);
  expect(container.firstChild).toBeInTheDocument();
}); 