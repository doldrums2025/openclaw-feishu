import type { FeishuToolsConfig } from "./types.js";

/**
 * Default tool configuration.
 * - doc, wiki, drive, bitable, calendar, minutes, scopes: enabled by default
 * - perm: disabled by default (sensitive operation)
 */
export const DEFAULT_TOOLS_CONFIG: Required<FeishuToolsConfig> = {
  doc: true,
  wiki: true,
  drive: true,
  perm: false,
  scopes: true,
  bitable: true,
  calendar: true,
  minutes: true,
};

/**
 * Resolve tools config with defaults.
 */
export function resolveToolsConfig(cfg?: FeishuToolsConfig): Required<FeishuToolsConfig> {
  return { ...DEFAULT_TOOLS_CONFIG, ...cfg };
}
