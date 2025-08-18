# Typography System

## Overview

This document outlines the comprehensive typography system implemented for the HSB website. The system is designed to provide optimal readability, accessibility, and visual hierarchy across all devices and screen sizes.

## Font Families

### Primary Fonts

1. **Outfit** - Display & Headings
   - Modern, geometric sans-serif
   - Perfect for headlines, branding, and display text
   - Excellent readability at large sizes
   - Used for: H1, H2, H3, H4, H5, H6, logos, brand elements

2. **Plus Jakarta Sans** - Body Text
   - Highly legible sans-serif optimized for screen reading
   - Excellent for long-form content and UI elements
   - Used for: paragraphs, body text, form elements, navigation

3. **Roboto** - Legacy Support
   - Fallback font for compatibility
   - Used in specific legacy components

## Typography Scale

### Headings

```css
h1 { /* text-heading-xl */
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

h2 { /* text-heading-lg */
  font-size: 1.875rem; /* 30px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h3 { /* text-heading-md */
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h4 { /* text-heading-sm */
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

### Body Text

```css
.text-body-lg {
  font-size: 1.125rem; /* 18px */
  line-height: 1.7;
  font-weight: 400;
}

.text-body-md {
  font-size: 1rem; /* 16px */
  line-height: 1.7;
  font-weight: 400;
}

.text-body-sm {
  font-size: 0.875rem; /* 14px */
  line-height: 1.6;
  font-weight: 400;
}

.text-caption {
  font-size: 0.75rem; /* 12px */
  line-height: 1.5;
  font-weight: 400;
}
```

## Utility Classes

### Typography Utilities

```css
.text-display          /* Outfit font for display text */
.text-ui              /* Plus Jakarta Sans for UI elements */
.text-mono            /* Monospace font for code */
.text-readable        /* Optimized for reading */
.text-emphasis        /* Emphasized text */
.text-muted           /* Muted text color */
```

### Responsive Typography

```css
.text-responsive-sm   /* Small text that scales */
.text-responsive-md   /* Medium text that scales */
.text-responsive-lg   /* Large text that scales */
```

### Component Utilities

```css
.btn-primary          /* Primary button typography */
.btn-secondary        /* Secondary button typography */
.input-field          /* Form input typography */
.card-title           /* Card title typography */
.card-subtitle        /* Card subtitle typography */
.nav-link             /* Navigation link typography */
.footer-heading       /* Footer heading typography */
.footer-text          /* Footer text typography */
```

## Usage Guidelines

### Headings

- Use semantic heading hierarchy (H1 → H2 → H3, etc.)
- H1 should be used once per page for the main title
- Maintain consistent heading levels across similar content
- Use appropriate font weights and sizes for visual hierarchy

### Body Text

- Use `text-body-md` for standard paragraph text
- Use `text-body-lg` for important content or introductory text
- Use `text-body-sm` for captions, metadata, and secondary information
- Maintain line height of 1.7 for optimal readability

### Buttons

- Use `btn-primary` for main call-to-action buttons
- Use `btn-secondary` for secondary actions
- Ensure sufficient contrast for accessibility

### Forms

- Use `input-field` for consistent form styling
- Maintain proper spacing and typography for labels
- Use appropriate font sizes for different input types

## Accessibility Features

### Font Features

```css
font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
```

- **Kern**: Automatic kerning for better letter spacing
- **Liga**: Ligatures for improved readability
- **Calt**: Contextual alternates for better typography

### Color Contrast

- All text meets WCAG AA standards for contrast
- Muted text uses appropriate gray values
- Emphasis text uses darker colors for better visibility

### Responsive Design

- Font sizes scale appropriately on different screen sizes
- Line heights adjust for optimal reading on mobile devices
- Touch targets maintain proper sizing for mobile interaction

## Implementation Examples

### Basic Usage

```jsx
<h1 className="text-heading-xl">Main Page Title</h1>
<h2 className="text-heading-lg">Section Heading</h2>
<p className="text-body-md">Standard paragraph text with improved readability.</p>
<button className="btn-primary">Primary Action</button>
```

### Card Component

```jsx
<div className="card">
  <h3 className="card-title">Card Title</h3>
  <p className="card-subtitle">Card subtitle</p>
  <p className="text-readable">Card content with enhanced readability.</p>
</div>
```

### Form Element

```jsx
<label className="text-ui font-medium">Email Address</label>
<input 
  type="email" 
  className="input-field" 
  placeholder="Enter your email"
/>
```

## Best Practices

1. **Consistency**: Use the established typography system consistently across all components
2. **Hierarchy**: Maintain clear visual hierarchy with appropriate heading levels
3. **Readability**: Ensure sufficient contrast and line height for optimal reading
4. **Responsive**: Test typography on different screen sizes and devices
5. **Accessibility**: Follow WCAG guidelines for text contrast and sizing
6. **Performance**: Use font-display: swap for better loading performance

## Browser Support

- Modern browsers with variable font support
- Fallback fonts for older browsers
- Progressive enhancement for advanced typography features

## Performance Considerations

- Font files are optimized and subset for web use
- Font-display: swap for better loading performance
- Preload critical fonts for faster rendering
- Use system fonts as fallbacks for better performance

## Future Enhancements

- Consider adding more font weights for greater flexibility
- Implement dark mode typography adjustments
- Add support for RTL languages
- Consider variable font implementation for better performance
