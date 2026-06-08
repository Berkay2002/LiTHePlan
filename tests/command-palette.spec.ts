import { expect, test } from "@playwright/test";

test.describe("Global command palette", () => {
  test("opens with Ctrl+K without a client-side exception", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Control+k");

    await expect(
      page.getByRole("dialog", { name: "Command Palette" })
    ).toBeVisible();
    await expect(
      page
        .getByRole("dialog", { name: "Command Palette" })
        .getByRole("combobox")
    ).toBeFocused();
    expect(pageErrors).toEqual([]);
  });
});
