const path = require('path')
const { sharedHelper } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const {
  gotoLoggedIn,
  step,
  attachScreenshot,
  hasCredentials,
  loginAs,
} = sharedHelper('login')
const {
  hasTenantAdminCredentials,
  getTenantAdminCredentials,
} = sharedHelper('credentials')
const { clickReady } = sharedHelper('ready')

function tenantAdminNav(page) {
  return page
    .getByTestId('nav-tenant-adminpanel')
    .or(page.locator('.item.tenant-adminpanel .link').first())
    .first()
}

function tenantAdminScreen(page) {
  return page
    .getByTestId('tenant-admin-screen')
    .or(page.locator('.screen.AdminPanelLayout').first())
    .first()
}

function tenantAdminIframe(page) {
  return page
    .getByTestId('tenant-admin-iframe')
    .or(page.locator('#adminpanel_iframe').first())
    .first()
}

test.describe('Desktop Tenant Admin panel', () => {
  test('opens tenant admin iframe when the account has TenantAdmin role', async ({
    page,
  }) => {
    test.setTimeout(T(120000))

    if (hasTenantAdminCredentials()) {
      await step('Sign in as tenant admin', async () => {
        await page.context().clearCookies()
        await loginAs(page, getTenantAdminCredentials())
      })
    } else {
      test.skip(!hasCredentials(), 'Set E2E_LOGIN_PRIMARY in .env.e2e')
      await gotoLoggedIn(page)
    }

    const nav = tenantAdminNav(page)
    test.skip(
      !(await nav.isVisible().catch(() => false)),
      'Tenant Admin tab is not available for this account (needs TenantAdmin role or E2E_LOGIN_TENANT_ADMIN)'
    )

    await step('Open Tenant Admin screen', async () => {
      await clickReady(nav)
      await page.waitForURL(/#tenant-adminpanel/i, { timeout: T(30000) })
      const screen = tenantAdminScreen(page)
      await expect(screen).toBeVisible({ timeout: T(30000) })
      await expect(tenantAdminIframe(page)).toBeVisible({ timeout: T(30000) })
      await attachScreenshot(page, 'tenant-admin-01-iframe')
    })
  })
})
