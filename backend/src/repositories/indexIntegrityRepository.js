import { Restaurant } from '../models/Restaurant.js';
import { Teuda } from '../models/Teuda.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { ImageCleanup } from '../models/ImageCleanup.js';

export const integrityModels = [User, Restaurant, Teuda, Report, PasswordResetToken, ImageCleanup];
const canonical = (value) => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
};
const same = (left, right) => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));

// Read-only startup gate. Declarations are not evidence that the database enforces uniqueness.
export const assertUniqueIndexesRepo = async (models = integrityModels) => {
  const missing = [];
  for (const model of models) {
    let actual;
    try { actual = await model.collection.listIndexes().toArray(); }
    catch (error) { if (error.code !== 26) throw error; actual = []; }
    for (const [key, options] of model.schema.indexes().filter(([, options]) => options.unique)) {
      const matching = actual.some((index) => index.unique === true &&
        // Key order matters for compound index declarations.
        JSON.stringify(Object.entries(index.key)) === JSON.stringify(Object.entries(key)) &&
        Boolean(index.sparse) === Boolean(options.sparse) &&
        same(index.partialFilterExpression, options.partialFilterExpression) &&
        same(index.collation, options.collation));
      if (!matching) missing.push(`${model.collection.collectionName}:${options.name || Object.keys(key).join('+')}`);
    }
  }
  if (missing.length) throw new Error(`Required unique indexes are missing or incompatible: ${missing.join(', ')}. Provision indexes with operator approval before starting; no automatic index migration was run.`);
};
