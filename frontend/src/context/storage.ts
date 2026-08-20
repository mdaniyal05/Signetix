export const getStorageValue = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const setStorageValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export const removeStorageValue = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
