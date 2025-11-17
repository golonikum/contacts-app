export function formatYearsInRussian(num: number) {
  // Handle special cases for numbers ending in 11-14
  if (num % 100 >= 11 && num % 100 <= 14) {
    return `${num} лет`;
  }

  // Handle other cases based on the last digit
  switch (num % 10) {
    case 1:
      return `${num} год`;
    case 2:
    case 3:
    case 4:
      return `${num} года`;
    default:
      return `${num} лет`;
  }
}
