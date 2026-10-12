import { expect, test } from '@playwright/test';

test('real backend health and module navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Backend disponible · PostgreSQL et migration vérifiés.')).toBeVisible();
  for (const code of ['MM', 'FI', 'SD', 'CO', 'Security']) {
    await page.getByRole('navigation').getByRole('link', { name: code, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(code);
    await expect(page.getByText('Module en préparation', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Module en préparation', { exact: true })).toBeVisible();
  }
});

test('loading, error and retry states', async ({ page }) => {
  let release: (() => void) | undefined;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/health', async route => { await waiting; await route.fulfill({ status: 503, body: '{}' }); });
  await page.goto('/');
  await expect(page.getByText('Vérification du backend…')).toBeVisible();
  release?.();
  await expect(page.getByText('Backend indisponible.', { exact: false })).toBeVisible();
  await page.unroute('**/api/health');
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(page.getByText('Backend disponible · PostgreSQL et migration vérifiés.')).toBeVisible();
});
