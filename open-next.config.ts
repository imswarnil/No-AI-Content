import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext adapter config. Defaults are fine for this app: every route is
 * either static or `force-dynamic`, and the only state lives in Neon, which
 * the Neon serverless driver reaches over HTTP — so there is nothing here that
 * needs Workers KV-backed incremental cache.
 */
export default defineCloudflareConfig();
