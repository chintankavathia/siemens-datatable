import { expect, test } from '../support/test-helpers';

test.describe('table with filter', () => {
  const example = 'filter';

  test(example, async ({ ngx, page }) => {
    await ngx.visitExample(example);
    await expect(page.getByText('Sarah Massey')).toBeVisible();
    await ngx.runVisualAndA11yTests();

    const paginator = page.locator('.datatable-pager').getByText('2');
    paginator.click();
    await expect(page.getByText('Sarah Massey')).not.toBeVisible();
    await expect(page.getByText('Robles Boyle')).toBeVisible();
    await ngx.runVisualAndA11yTests('next-page');

    const filter = page.getByPlaceholder('Type to filter the name column...');
    filter.clear();
    filter.pressSequentially('Wong Craft');
    await expect(page.getByText('1 total')).toBeVisible();
    await ngx.runVisualAndA11yTests('filtered');

    filter.clear();
    filter.pressSequentially('Some random text');
    await expect(page.getByText('No data to display')).toBeVisible();
    await ngx.runVisualAndA11yTests('empty');
  });
});
