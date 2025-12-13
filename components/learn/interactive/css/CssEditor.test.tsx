import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CssEditor } from './CssEditor';

// Mock the CodeEditor component
vi.mock('@/components/ui/code-editor', () => ({
  CodeEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('CssEditor', () => {
  it('renders without crashing', () => {
    render(<CssEditor />);
    expect(screen.getByText('CSS Editor')).toBeInTheDocument();
  });

  it('displays the copy button', () => {
    render(<CssEditor />);
    expect(screen.getByText('Copy CSS')).toBeInTheDocument();
  });

  it('displays the reset button', () => {
    render(<CssEditor />);
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('renders with initial CSS', () => {
    const initialCss = '.test { color: red; }';
    render(<CssEditor initialCss={initialCss} />);
    const editor = screen.getByTestId('code-editor');
    expect(editor).toHaveValue(initialCss);
  });

  it('shows preview tab when showPreview is true', () => {
    render(<CssEditor showPreview={true} />);
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('hides preview tab when showPreview is false', () => {
    render(<CssEditor showPreview={false} />);
    expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
  });

  it('displays validation message when validation fails', () => {
    const validateAgainst = vi.fn(() => ({
      valid: false,
      message: 'Missing required property',
    }));

    render(<CssEditor validateAgainst={validateAgainst} />);
    
    // Wait for validation to run (debounced)
    setTimeout(() => {
      expect(screen.getByText('Missing required property')).toBeInTheDocument();
    }, 400);
  });

  it('displays success message when validation passes', () => {
    const validateAgainst = vi.fn(() => ({
      valid: true,
      message: 'CSS is valid!',
    }));

    render(<CssEditor validateAgainst={validateAgainst} />);
    
    // Wait for validation to run (debounced)
    setTimeout(() => {
      expect(screen.getByText('CSS is valid!')).toBeInTheDocument();
    }, 400);
  });
});
