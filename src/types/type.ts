import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schema";

type DrizzleDB = DrizzleD1Database<typeof schema>;

export type Context = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    OVERLAY_ROOM: DurableObjectNamespace;
  };
  Variables: {
    db: DrizzleDB;
  };
};
