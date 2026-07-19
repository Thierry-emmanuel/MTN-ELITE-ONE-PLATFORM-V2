import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaUploader } from './AdminUI';

describe('MediaUploader', () => {
  it('renders without crashing when value is undefined', () => {
    render(<MediaUploader label="Image" value={undefined} onChange={() => {}} />);

    expect(screen.getByText(/Glissez-déposez votre fichier ici/i)).toBeInTheDocument();
  });
});
