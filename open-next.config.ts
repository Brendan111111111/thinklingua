import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2 from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2,
});
