import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from './card';

test('renders Card with title and content', () => {
  render(
    <Card>
      <CardHeader>
        <CardTitle>Test Card</CardTitle>
      </CardHeader>
      <CardContent>Card content</CardContent>
    </Card>
  );
  expect(screen.getByText('Test Card')).toBeInTheDocument();
  expect(screen.getByText('Card content')).toBeInTheDocument();
}); 