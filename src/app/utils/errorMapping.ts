export const errorToLocaleKeyMap: { [key: string]: string } = {
  'Invalid credentials': 'Невірні облікові дані',
  'User not found': 'Користувача не знайдено',
  'Password must contain at least one number': 'Пароль має містити принаймні одну цифру',
  'Password must contain at least one uppercase letter': 'Пароль має містити принаймні одну велику літеру'
}

/**
 * @param {string} incomingMessage
 * @returns {string}
 */
export function getDisplayError(incomingMessage: string): string {
  const translatedMessage = errorToLocaleKeyMap[incomingMessage];

  return translatedMessage || incomingMessage;
}
