import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
async function checkWidth(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
test("protected pages require sign-in", async ({ page }) => {
  await page.goto("/s/naperville-north/staff");
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
});

test("password visibility, errors, persistent session and sign-out", async ({ page }, testInfo) => {
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("teacher@club-compass.test");
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("WrongPassword123!");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("not accepted");
  await expect(password).toHaveValue("WrongPassword123!");
  await password.fill("TeacherDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/s\/naperville-north\/staff$/);
  await expect(page.getByRole("heading", { name: "My activities", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research Workshop Draft" })).toBeVisible();
  await expect(page.getByText("Unassigned Service Draft")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
  await page.getByRole("navigation", { name: "School navigation" }).getByRole("link", { name: "Explore" }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.getByRole("link", { name: "Science Challenge Demo", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Science Challenge Demo", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  await page.goto("/login");
  await expect(page).toHaveURL(/\/s\/naperville-north\/staff$/);
  await checkWidth(page);
  await page.screenshot({ path: testInfo.outputPath("staff.png"), fullPage: true });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/s/naperville-north/staff");
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(failures).toEqual([]);
});

for (const school of [
  { slug: "naperville-north", suffix: "", other: "harbor-high", published: "Science Challenge Demo", draft: "Research Workshop Draft" },
  { slug: "harbor-high", suffix: ".harbor", other: "naperville-north", published: "Harbor Design Demo", draft: "Harbor Writing Draft" },
]) {
  for (const role of [
    { prefix: "student", password: "StudentDemo123!", landing: "explore", heading: "Explore activities" },
    { prefix: "teacher", password: "TeacherDemo123!", landing: "staff", heading: "My activities" },
    { prefix: "admin", password: "AdminDemo123!", landing: "admin", heading: "School overview" },
  ]) {
    test(school.slug + ": " + role.prefix + " access stays inside its role and school", async ({ page }, testInfo) => {
      await signIn(page, role.prefix + school.suffix + "@club-compass.test", role.password);
      await expect(page).toHaveURL(new RegExp("/s/" + school.slug + "/" + role.landing + "$"));
      await expect(page.getByRole("heading", { name: role.heading, exact: true })).toBeVisible();
      await checkWidth(page);
      await page.screenshot({ path: testInfo.outputPath(role.prefix + ".png"), fullPage: true });
      if (role.prefix !== "admin") {
        await page.goto("/s/" + school.slug + "/admin");
        await expect(page).toHaveURL(new RegExp("/" + role.landing + "$"));
      }
      if (role.prefix === "student") {
        await page.goto("/s/" + school.slug + "/staff");
        await expect(page).toHaveURL(/\/explore$/);
        await expect(page.getByRole("heading", { name: school.published, exact: true })).toBeVisible();
        await expect(page.getByText(school.draft, { exact: true })).toHaveCount(0);
        await expect(page.locator("main")).not.toContainText("2025");
      }
      await page.goto("/s/" + school.other + "/explore");
      await expect(page.getByRole("heading", { name: "We couldn’t open this page." })).toBeVisible();
      await expect(page.locator("main .activity-card")).toHaveCount(0);
      await page.goto("/s/" + school.slug + "/account");
      await expect(page.locator("main")).toContainText(role.prefix + school.suffix + "@club-compass.test");
      await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
    });
  }
}

test("redirects stay on this site and browser resources contain no privileged credentials", async ({ page }) => {
  await page.goto("/login?next=https%3A%2F%2Fexample.com");
  await page.getByLabel("Email", { exact: true }).fill("student@club-compass.test");
  await page.getByLabel("Password", { exact: true }).fill("StudentDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/s\/naperville-north\/explore$/);
  const secretPattern = /sb_secret_[A-Za-z0-9_-]{20,}/;
  expect(await page.content()).not.toMatch(secretPattern);
  const sources = await page.locator("script[src]").evaluateAll(elements => elements.map(element => (element as HTMLScriptElement).src));
  for (const source of sources) {
    const response = await page.request.get(source);
    expect(response.ok()).toBe(true);
    expect(await response.text()).not.toMatch(secretPattern);
  }
});
