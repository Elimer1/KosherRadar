// NEW (Redesign wave 1): the place line already used on the restaurant page.
// City is omitted when the street line already contains it.
// חדש (גל עיצוב 1): שורת המקום. העיר מושמטת כשהרחוב כבר כולל אותה.
export function placeLine(address: string, city: string | null) {
  const street = address.trim();
  const cityName = city?.trim() ?? '';
  const showCity = cityName !== '' && !street.includes(cityName);
  return [street, showCity ? cityName : ''].filter((part) => part !== '').join(', ');
}
