# Changelog

This file documents all notable changes made to the website as part of the implementation plan. Each change includes a justification for why it was added and how it improves the website.

## [Unreleased]

### Accessibility Enhancements

#### Added Alt Text to Images
- **Date:** 2025-03-09
- **Description:** Added descriptive alt text to all images on the website.
- **Justification:** 
  - Improves accessibility for users with visual impairments who use screen readers
  - Provides context when images fail to load
  - Helps search engines understand image content, potentially improving SEO
  - Complies with WCAG 2.1 Success Criterion 1.1.1 (Non-text Content)

#### Added ARIA Attributes
- **Date:** 2025-03-09
- **Description:** Added semantic ARIA roles and labels to major page sections.
- **Justification:**
  - Improves navigation for users of assistive technologies
  - Provides clearer structure for screen readers
  - Enhances the semantic meaning of elements (especially for table-based layouts)
  - Complies with WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships)
  - Added roles include:
    - `role="presentation"` for layout tables
    - `role="banner"` for the header
    - `role="region"` with appropriate `aria-label` for main content sections
    - `role="navigation"` for link groups
    - `role="contentinfo"` for the footer

#### Added Meta Description
- **Date:** 2025-03-09
- **Description:** Added meta description tag to improve SEO.
- **Justification:**
  - Helps search engines understand the page content
  - Improves appearance in search results
  - Provides a concise summary of the page content

### Performance Optimization

#### Implemented Lazy Loading for Images
- **Date:** 2025-03-09
- **Description:** Added loading="lazy" attribute to all images.
- **Justification:**
  - Improves page load performance by deferring off-screen images
  - Reduces initial page load time
  - Saves bandwidth for users who don't scroll to the bottom
  - Supported natively in modern browsers

### CSS Improvements

#### Added CSS Variables
- **Date:** 2025-03-09
- **Description:** Added CSS variables for colors, spacing, and typography.
- **Justification:**
  - Enables consistent styling across the website
  - Makes future design changes easier by centralizing values
  - Improves maintainability of the codebase
  - Follows modern CSS best practices

#### Moved Inline Styles to Stylesheet
- **Date:** 2025-03-09
- **Description:** Replaced inline styles with CSS classes in the stylesheet.
- **Justification:**
  - Separates content from presentation
  - Reduces HTML file size
  - Improves maintainability by centralizing styles
  - Enables easier site-wide style changes
  - Follows best practices for CSS organization

#### Added Responsive Design
- **Date:** 2025-03-09
- **Description:** Added media queries for mobile responsiveness.
- **Justification:**
  - Improves user experience on mobile devices
  - Ensures content is readable on all screen sizes
  - Follows modern web design standards
  - Potentially improves SEO as mobile-friendliness is a ranking factor

## Planned Improvements

### Performance Optimization
- Optimize images
- Configure caching headers

### JavaScript Improvements
- Create separate JavaScript file
- Refactor image hover scripts

### New Features
- Add blog/news section
- Add citation generator
- Improve SEO with meta tags and sitemap
