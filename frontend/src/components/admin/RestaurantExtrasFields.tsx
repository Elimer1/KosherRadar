// NEW (Milestone 3): the admin-only restaurant fields: Hebrew/English names and addresses, a private note
// and the link to the official kosharot page. They sit under the normal restaurant fields.
// חדש (אבן דרך 3): שדות המסעדה שרק מנהל רואה: שמות וכתובות בעברית ובאנגלית, הערה פרטית וקישור לדף הרשמי.
import { useTranslation } from 'react-i18next';
import type { RestaurantExtrasValues } from '../../types/admin';
import { inputClassName, labelClassName } from '../formStyles';

interface RestaurantExtrasFieldsProps {
  values: RestaurantExtrasValues;
  disabled: boolean;
  // NEW (update): a new restaurant keeps the note and the Kosharot link. Editing still has the names.
  // חדש (עדכון): מסעדה חדשה שומרת את ההערה וקישור כושרות. בעריכה נשארים גם השמות.
  includeNames?: boolean;
  onChange: (field: keyof RestaurantExtrasValues, value: string) => void;
}

function RestaurantExtrasFields({ values, disabled, includeNames = true, onChange }: RestaurantExtrasFieldsProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{t('desk.adminDetails')}</h2>

      {includeNames && <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="extras-name-he" className={labelClassName}>
            {t('desk.nameHe')}
          </label>
          <input
            id="extras-name-he"
            type="text"
            dir="rtl"
            maxLength={150}
            disabled={disabled}
            value={values.nameHe}
            onChange={(event) => onChange('nameHe', event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="extras-name-en" className={labelClassName}>
            {t('desk.nameEn')}
          </label>
          <input
            id="extras-name-en"
            type="text"
            maxLength={150}
            disabled={disabled}
            value={values.nameEn}
            onChange={(event) => onChange('nameEn', event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="extras-address-he" className={labelClassName}>
            {t('desk.addressHe')}
          </label>
          <input
            id="extras-address-he"
            type="text"
            dir="rtl"
            maxLength={250}
            disabled={disabled}
            value={values.addressHe}
            onChange={(event) => onChange('addressHe', event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="extras-address-en" className={labelClassName}>
            {t('desk.addressEn')}
          </label>
          <input
            id="extras-address-en"
            type="text"
            maxLength={250}
            disabled={disabled}
            value={values.addressEn}
            onChange={(event) => onChange('addressEn', event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>}

      <div>
        <label htmlFor="extras-kosharot-url" className={labelClassName}>
          {t('desk.kosharotLink')}
        </label>
        <input
          id="extras-kosharot-url"
          type="url"
          maxLength={500}
          disabled={disabled}
          value={values.kosharotUrl}
          onChange={(event) => onChange('kosharotUrl', event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="extras-admin-note" className={labelClassName}>
          {t('desk.privateAdmins')}
        </label>
        <textarea
          id="extras-admin-note"
          rows={3}
          maxLength={1000}
          disabled={disabled}
          value={values.adminNote}
          onChange={(event) => onChange('adminNote', event.target.value)}
          className={inputClassName}
        />
      </div>
    </section>
  );
}

export default RestaurantExtrasFields;
