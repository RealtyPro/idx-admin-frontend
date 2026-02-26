import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent } from './dialog';

test('renders Dialog with content', () => {
  render(
    <Dialog open>
      <DialogContent>
        <div>Dialog Content</div>
      </DialogContent>
    </Dialog>
  );
  expect(screen.getByText('Dialog Content')).toBeInTheDocument();
}); 