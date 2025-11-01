# Playwright Tests for LiTHePlan

This directory contains end-to-end tests for the LiTHePlan application using Playwright.

## Test Files

### `search-bar.spec.ts`
Comprehensive visual and functional tests for the search bar component (`InputGroup` UI component).

**Test Coverage:**
- ✅ Initial visual state verification
- ✅ Text input and clear functionality
- ✅ Focus and interaction states
- ✅ Search results filtering
- ✅ Mobile responsive behavior
- ✅ Keyboard navigation
- ✅ InputGroup component styling
- ✅ Real-time filtering performance
- ✅ Accessibility compliance (WCAG)

**Key Features Tested:**
- Search input placeholder and value
- Search icon presence
- Keyboard shortcuts (⌘K) visibility
- Clear button functionality
- Focus states and visual feedback
- Mobile viewport behavior
- Keyboard navigation and shortcuts
- ARIA attributes and roles
- Component styling classes
- Performance benchmarks

## Running Tests

### All Tests
```bash
npm test
```

### Chromium Only
```bash
npm run test:chromium
```

### Interactive UI Mode
```bash
npm run test:ui
```

### View Last Test Report
```bash
npm run test:report
```

### Specific Test File
```bash
npx playwright test search-bar.spec.ts
```

### Debug Mode
```bash
npx playwright test --debug
```

## Configuration

Tests are configured in `playwright.config.ts` at the project root.

**Browsers Tested:**
- Chromium (Desktop Chrome)
- Firefox (Desktop)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

**Dev Server:**
- Automatically starts `npm run dev` before tests
- Runs on `http://localhost:3000`
- Reuses existing server in development

## Writing New Tests

Follow the Playwright instructions in `.github/instructions/playwright-typescript.instructions.md`:

1. **Use role-based locators**: `getByRole`, `getByLabel`, `getByText`
2. **Use test.step()**: Group interactions for better reporting
3. **Web-first assertions**: Use `await expect(locator).toBeVisible()`
4. **Avoid hard waits**: Rely on Playwright's auto-waiting
5. **Descriptive titles**: `Feature - Specific action or scenario`

### Example Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Feature - Specific action', async ({ page }) => {
    await test.step('Step description', async () => {
      const element = page.getByRole('button', { name: 'Click me' });
      await expect(element).toBeVisible();
    });
  });
});
```

## Test Best Practices

- **Accessibility-first**: Use ARIA roles and semantic selectors
- **Resilient locators**: Avoid CSS classes, use user-facing attributes
- **Clear assertions**: Test user expectations, not implementation
- **Performance checks**: Verify response times meet requirements
- **Mobile testing**: Include responsive viewport tests
- **Keyboard navigation**: Test accessibility features

## Troubleshooting

### Tests Failing Locally
1. Ensure dev server is running: `npm run dev`
2. Clear browser cache: `npx playwright clean`
3. Update browsers: `npx playwright install`

### Timeout Errors
- Increase timeout in specific test: `{ timeout: 10000 }`
- Check if dev server started properly
- Look for console errors in test output

### Visual Regression
- Update snapshots: `npx playwright test --update-snapshots`
- Review changes before committing

## CI/CD Integration

Tests run automatically on CI with:
- Headless mode enabled
- Single worker (no parallel execution)
- 2 retries for flaky tests
- HTML report generation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Project Instructions](.github/instructions/playwright-typescript.instructions.md)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
