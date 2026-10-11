// NEW (Milestone 4): one search result: name, place, food type, categories, kashrut status, distance, Call and Waze.
// There are no ratings or reviews: KosherRadar is a factual directory.
// חדש (אבן דרך 4): תוצאת חיפוש אחת: שם, מקום, סוג אוכל, קטגוריות, כשרות, מרחק, התקשר ו-Waze. אין דירוגים או ביקורות.
import { Link } from 'react-router-dom';
import type { RestaurantCardData } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import { getCategoryLabel, getFoodTypeLabel } from '../utils/labels';
import { formatDistance } from '../utils/kashrutText';
import { buildTelUrl, buildWazeUrl } from '../utils/navigationLinks';
import KashrutBadge from './KashrutBadge';

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
}

const actionClassName =
  'rounded border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50';

function RestaurantCard({ restaurant, hechsherOptions }: RestaurantCardProps) {
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  // The address often already contains the city; do not repeat it.
  const showCity = restaurant.city && !restaurant.address.includes(restaurant.city);
  const place = showCity ? `${restaurant.address}, ${restaurant.city}` : restaurant.address;
  const distanceText = formatDistance(restaurant.distanceKm);

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            <Link to={`/restaurants/${restaurant.id}`} className="hover:text-green-700 hover:underline">
              {restaurant.name}
            </Link>
          </h2>
          <p className="text-sm text-gray-600">{place}</p>
        </div>
        {distanceText && <p className="text-sm font-medium text-gray-700">{distanceText}</p>}
      </div>

      <p className="mt-2 text-sm text-gray-700">
        <span className="font-medium">{getFoodTypeLabel(restaurant.foodType)}</span>
        {restaurant.categories.length > 0 && (
          <span> · {restaurant.categories.map((category) => getCategoryLabel(category)).join(', ')}</span>
        )}
      </p>

      <div className="mt-3">
        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to={`/restaurants/${restaurant.id}`}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          View details
        </Link>
        {telUrl && (
          <a href={telUrl} className={actionClassName} aria-label={`Call ${restaurant.name}`}>
            Call
          </a>
        )}
        {wazeUrl && (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClassName}
            aria-label={`Navigate to ${restaurant.name} with Waze`}
          >
            Waze
          </a>
        )}
      </div>
    </li>
  );
}

export default RestaurantCard;
