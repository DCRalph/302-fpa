export type ThemeChoice = "light" | "dark";
export type ThemeSelection = ThemeChoice | "system";

// Loosely typed to accommodate different user objects from auth libs
type UpdatableUser = {
  update: (args: any) => Promise<any>;
  clientMetadata?: unknown;
} | null | undefined;

/**
 * Sets the theme locally and, if a user is present, persists the selection to user client metadata.
 * Returns true if the theme was successfully saved to the user's profile, otherwise false.
 */
export async function setThemeAndPersist(
  value: ThemeSelection,
  options: { user: UpdatableUser; setTheme: (value: string) => void }
): Promise<boolean> {
  const { user, setTheme } = options;
  setTheme(value);

  if (!user) return false;

  const previous = (user.clientMetadata ?? {}) as Record<string, unknown>;
  try {
    await user.update({ clientMetadata: { ...previous, theme: value } as unknown });
    return true;
  } catch {
    return false;
  }
}


