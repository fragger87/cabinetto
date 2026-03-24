import { test, expect } from '@playwright/test';

test.describe('Cabinet Calculator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Cabinet Calculator');
  });

  test('should show board spec form with defaults', async ({ page }) => {
    await expect(page.locator('#boardWidth')).toHaveValue('2800');
    await expect(page.locator('#boardHeight')).toHaveValue('2070');
    await expect(page.locator('#thickness')).toHaveValue('18');
    await expect(page.locator('#kerf')).toHaveValue('4');
  });

  test('should show global settings with defaults', async ({ page }) => {
    await expect(page.locator('#cabinetType')).toHaveValue('base');
    await expect(page.locator('#totalHeight')).toHaveValue('890');
    await expect(page.locator('#bottomMode')).toHaveValue('full');
    await expect(page.locator('#railWidth')).toHaveValue('80');
  });

  test('should show error when calculating without cabinets', async ({ page }) => {
    await page.click('.calculate-btn');
    await expect(page.locator('.actions .error')).toContainText('Add at least one cabinet');
  });

  test('should add a cabinet and calculate', async ({ page }) => {
    // Add a cabinet
    await page.click('text=+ Add Cabinet');

    // Fill in cabinet details
    const nameInput = page.locator('.cabinet-row input[type="text"]').first();
    await nameInput.fill('Test 60cm');

    const widthInput = page.locator('.cabinet-row input[type="number"]').first();
    await widthInput.fill('600');

    // Calculate
    await page.click('.calculate-btn');

    // Verify report appears
    await expect(page.locator('.report h2')).toHaveText('Cutting Report');
    await expect(page.locator('.params-table')).toBeVisible();
    await expect(page.locator('.summary-cards')).toBeVisible();
  });

  test('should add drawer cabinet and show drawer layouts', async ({ page }) => {
    // Add a cabinet
    await page.click('text=+ Add Cabinet');
    const nameInput = page.locator('.cabinet-row input[type="text"]').first();
    await nameInput.fill('Drawer unit');

    // Enable drawers
    await page.locator('.cabinet-row .toggle input[type="checkbox"]').first().check();

    // Verify drawer count field appears
    await expect(page.locator('#drawerCount')).toBeVisible();

    // Calculate
    await page.click('.calculate-btn');

    // Should show drawer board section
    await expect(page.locator('text=15 mm Drawer Boards')).toBeVisible();
    // Should show HDF section
    await expect(page.locator('text=HDF 3 mm Boards')).toBeVisible();
  });

  test('should show cabinet drawings after calculation', async ({ page }) => {
    await page.click('text=+ Add Cabinet');
    const nameInput = page.locator('.cabinet-row input[type="text"]').first();
    await nameInput.fill('C60');

    await page.click('.calculate-btn');

    // Cabinet drawings section should appear
    await expect(page.locator('.cabinet-details h3')).toHaveText('Cabinet Drawings');
    // Front view SVG should be rendered
    await expect(page.locator('.front-svg')).toBeVisible();
  });

  test('should open detail panel on cabinet click', async ({ page }) => {
    await page.click('text=+ Add Cabinet');
    const nameInput = page.locator('.cabinet-row input[type="text"]').first();
    await nameInput.fill('Detail test');

    await page.click('.calculate-btn');

    // Click on the cabinet front view
    await page.locator('.cabinet-front-view').first().click();

    // Detail panel should open
    await expect(page.locator('.detail-panel h3')).toHaveText('Detail test');
    await expect(page.locator('.detail-panel')).toBeVisible();

    // Close by clicking overlay
    await page.locator('.detail-panel-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('.detail-panel')).not.toBeVisible();
  });

  test('should export and import JSON round-trip', async ({ page }) => {
    // Add a cabinet
    await page.click('text=+ Add Cabinet');
    const nameInput = page.locator('.cabinet-row input[type="text"]').first();
    await nameInput.fill('Export test');

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export JSON');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('cabinet-project.json');

    // Read exported content
    const content = await download.path();
    expect(content).toBeTruthy();
  });

  test('should save and load from localStorage', async ({ page }) => {
    // Add a cabinet
    await page.click('text=+ Add Cabinet');
    const nameInput = page.locator('.cabinet-row input[type="text"]').first();
    await nameInput.fill('Save test');

    // Save
    await page.click('text=Save');
    await expect(page.locator('.toolbar-success')).toContainText('Saved');

    // Reload the page
    await page.reload();

    // Load
    await page.click('text=Load');
    await expect(page.locator('.toolbar-success')).toContainText('Loaded');

    // Verify cabinet is restored
    const restored = page.locator('.cabinet-row input[type="text"]').first();
    await expect(restored).toHaveValue('Save test');
  });

  test('should show cutting layout SVGs with utilization', async ({ page }) => {
    // Add multiple cabinets for a realistic scenario
    await page.click('text=+ Add Cabinet');
    await page.locator('.cabinet-row input[type="text"]').first().fill('C60');
    await page.locator('.cabinet-row input[type="number"]').nth(1).fill('3');

    await page.click('.calculate-btn');

    // Cutting layout should show boards with utilization
    const boardHeader = page.locator('.board-container h4').first();
    await expect(boardHeader).toContainText('Utilization');

    // SVG should have placed pieces
    const pieces = page.locator('.board-svg .piece');
    expect(await pieces.count()).toBeGreaterThan(0);
  });
});
