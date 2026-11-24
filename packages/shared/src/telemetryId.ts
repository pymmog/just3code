import { sha256 } from "@noble/hashes/sha2";
import * as Hex from "effect/encoding/Hex";

/**
 * Hashes the install or provider account id that an agent feedback report carries.
 */
export const hashTelemetryId = (value: string): string =>
  Hex.encode(sha256(new TextEncoder().encode(value)));

/** True for a `hashTelemetryId` result. The server accepts only this shape from clients. */
export const isTelemetryIdHash = (value: string): boolean => /^[0-9a-f]{64}$/u.test(value);
