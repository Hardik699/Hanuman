import * as fileStore from "./store";

let selected: any = fileStore;
const HAS_DB = Boolean(
  process.env.DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL,
);

if (HAS_DB) {
  import("./postgres")
    .then((pgStore) => {
      selected = pgStore;
    })
    .catch((err) => {
      console.error(
        "Failed to load Postgres store, falling back to file store:",
        err,
      );
      selected = fileStore;
    });
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    const impl = (selected as any).db;
    return (impl as any)[prop as any];
  },
});
