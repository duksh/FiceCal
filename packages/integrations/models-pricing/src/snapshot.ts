/**
 * Snapshot versioning for the duksh-models-adapter.
 *
 * Version format: sha256(content)[0:12]@YYYY-MM-DD
 * Example:        a3f9b12cd401@2026-03-20
 *
 * Content-addressed: if the hash matches the last ingested snapshot,
 * re-ingestion can be skipped (caller's responsibility).
 */

import { createHash } from "crypto";

/**
 * Compute a deterministic sourceVersion from raw data.json content.
 * @param content  Raw UTF-8 string content of data.json
 * @param asOf     Date to embed in the version (defaults to today)
 */
export function computeSourceVersion(content: string, asOf: Date = new Date()): string {
  const hash = createHash("sha256").update(content, "utf8").digest("hex").slice(0, 12);
  const date = asOf.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${hash}@${date}`;
}

/**
 * Parse a sourceVersion string into its components.
 * Returns null if the format is invalid.
 */
export function parseSourceVersion(
  version: string
): { hash: string; date: string } | null {
  const match = /^([0-9a-f]{12})@(\d{4}-\d{2}-\d{2})$/.exec(version);
  if (!match) return null;
  return { hash: match[1], date: match[2] };
}

/**
 * Return the age of a sourceVersion in days relative to a reference date.
 * Returns null if the version cannot be parsed.
 */
export function sourceVersionAgeInDays(
  version: string,
  relativeTo: Date = new Date()
): number | null {
  const parsed = parseSourceVersion(version);
  if (!parsed) return null;
  const snapshotDate = new Date(parsed.date);
  return Math.floor((relativeTo.getTime() - snapshotDate.getTime()) / 86_400_000);
}
