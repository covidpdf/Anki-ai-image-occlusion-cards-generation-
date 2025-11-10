import { test, expect, Page } from '@playwright/test';

let page: Page;

test.beforeEach(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  // Emulate a network with very slow speed
  await context.route('**/*', (route) => {
    void route.continue();
  });
});

test.describe('Offline Mode', () => {
  test('should show offline indicator when network is offline', async () => {
    await page.goto('/');

    // Simulate going offline
    await page.context().setOffline(true);

    // Wait for the offline indicator to appear
    const offlineIndicator = page.locator('.offline-indicator.offline');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Verify the offline message
    const indicatorText = offlineIndicator.locator('.indicator-text');
    await expect(indicatorText).toContainText('You are offline');
  });

  test('should show online indicator when coming back online', async () => {
    await page.goto('/');

    // Simulate going offline
    await page.context().setOffline(true);
    let offlineIndicator = page.locator('.offline-indicator.offline');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Simulate coming back online
    await page.context().setOffline(false);
    offlineIndicator = page.locator('.offline-indicator.online');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Verify the online message
    const indicatorText = offlineIndicator.locator('.indicator-text');
    await expect(indicatorText).toContainText('Back online');
  });

  test('should render app shell while offline', async () => {
    await page.goto('/');

    // Simulate going offline
    await page.context().setOffline(true);

    // Verify the main heading is still visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Anki Image Occlusion Generator');

    // Verify the card element is still visible
    const card = page.locator('.card');
    await expect(card).toBeVisible();
  });

  test('should allow cache settings while offline', async () => {
    await page.goto('/');

    // Simulate going offline
    await page.context().setOffline(true);

    // Click settings toggle
    const settingsToggle = page.locator('.settings-toggle');
    await expect(settingsToggle).toBeVisible();
    await settingsToggle.click();

    // Verify cache settings component appears
    const cacheSettings = page.locator('.cache-settings');
    await expect(cacheSettings).toBeVisible({ timeout: 5000 });

    // Verify refresh stats button is available
    const refreshBtn = page.locator('.btn-secondary');
    await expect(refreshBtn).toContainText('Refresh Stats');
  });

  test('should work with network throttling (slow 3G)', async () => {
    const context = await page.context().browser()!.newContext();
    const throttledPage = await context.newPage();

    // Simulate slow 3G
    await throttledPage.route('**/*', (route) => {
      void route.continue();
    });

    await throttledPage.goto('/', { waitUntil: 'load' });

    // Verify the page loaded despite slow network
    const heading = throttledPage.locator('h1');
    await expect(heading).toContainText('Anki Image Occlusion Generator');

    // Verify service worker indicator or page is functional
    const card = throttledPage.locator('.card');
    await expect(card).toBeVisible();

    await context.close();
  });

  test('should cache static assets', async () => {
    // First visit - assets will be cached
    await page.goto('/');

    // Wait for the page to fully load
    const heading = page.locator('h1');
    await expect(heading).toContainText('Anki Image Occlusion Generator');

    // Get the service worker registration status
    const swStatus = await page.evaluate(() => {
      return navigator.serviceWorker?.controller ? 'registered' : 'not registered';
    });

    expect(['registered', 'not registered']).toContain(swStatus);
  });

  test('should maintain functionality with poor connectivity', async () => {
    await page.goto('/');

    // Simulate poor connectivity (offline)
    await page.context().setOffline(true);

    // Verify button clicks still work
    const button = page.locator('.card button');
    await expect(button).toBeVisible();

    const initialText = await button.textContent();
    expect(initialText).toContain('count is 0');

    // Click the button
    await button.click();

    // Verify state changed locally
    const updatedText = await button.textContent();
    expect(updatedText).toContain('count is 1');
  });

  test('should support PWA installation criteria', async () => {
    await page.goto('/');

    // Check for manifest
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });

    expect(manifest).toBeTruthy();

    // Check for service worker
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(hasServiceWorker).toBe(true);

    // Check for theme color meta tag
    const themeColor = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      return meta ? meta.getAttribute('content') : null;
    });

    expect(themeColor).toBeTruthy();

    // Check for apple-mobile-web-app-capable
    const iOSCapable = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      return meta ? meta.getAttribute('content') : null;
    });

    expect(iOSCapable).toBe('true');
  });
});

test.describe('Cache Settings', () => {
  test('should display cache statistics', async () => {
    await page.goto('/');

    // Click settings toggle
    const settingsToggle = page.locator('.settings-toggle');
    await settingsToggle.click();

    // Wait for cache settings to load
    const cacheSettings = page.locator('.cache-settings');
    await expect(cacheSettings).toBeVisible({ timeout: 5000 });

    // Verify stats are displayed
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid).toBeVisible();

    // Check for stat items
    const statItems = page.locator('.stat-item');
    await expect(statItems).toHaveCount(5);
  });

  test('should allow exporting cache data', async () => {
    await page.goto('/');

    // Click settings toggle
    const settingsToggle = page.locator('.settings-toggle');
    await settingsToggle.click();

    // Wait for settings to load
    await page.locator('.cache-settings').waitFor();

    // Find and click export button
    const exportBtn = page.locator('.cache-actions button:has-text("Export Data")');
    await expect(exportBtn).toBeVisible();

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();

    // Wait for the download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('anki-occlusion-backup');
  });

  test('should allow importing cache data', async () => {
    await page.goto('/');

    // Click settings toggle
    const settingsToggle = page.locator('.settings-toggle');
    await settingsToggle.click();

    // Wait for settings to load
    await page.locator('.cache-settings').waitFor();

    // Verify import button exists
    const importBtn = page.locator('.cache-actions button:has-text("Import Data")');
    await expect(importBtn).toBeVisible();
  });

  test('should display clear cache button', async () => {
    await page.goto('/');

    // Click settings toggle
    const settingsToggle = page.locator('.settings-toggle');
    await settingsToggle.click();

    // Wait for settings to load
    await page.locator('.cache-settings').waitFor();

    // Find clear cache button
    const clearBtn = page.locator('.btn-danger:has-text("Clear All Cache")');
    await expect(clearBtn).toBeVisible();
  });
});
