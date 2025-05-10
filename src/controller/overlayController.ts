import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../types/type";

import { drizzle } from "drizzle-orm/d1";
import { getOverlaySettings, updateOverlaySettings } from "../routes/overlayRoute";
import { overlaySettings, users } from "../db/schema";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
const overlaySettingController = new OpenAPIHono<Context>()
  .openapi(updateOverlaySettings, async (c) => {
    const { id } = c.req.param();
    const db = drizzle(c.env.DB);
    const overlayData = c.req.valid("json")
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const [overlays] = await db
      .select()
      .from(overlaySettings)
      .where(eq(overlaySettings.userId, user.id));

    let updated;
    if (!overlays) {
      const [newOverlay] = await db
        .insert(overlaySettings)
        .values({
          userId: user.id,
          ...overlayData
        })
        .returning();
      updated = newOverlay;
    } else {
      const [updatedOverlays] = await db
        .update(overlaySettings)
        .set({
          ...overlayData
        })
        .where(eq(overlaySettings.id, overlays.id))
        .returning();
      updated = updatedOverlays;
    }
    return (c.json(updated, overlays ? 200 : 201))


  }).openapi(getOverlaySettings, async (c) => {
    const { id } = c.req.param()
    const db = drizzle(c.env.DB)
    const [settingsData] = await db.select().from(overlaySettings).where(eq(overlaySettings.userId, id))

    return (c.json(settingsData, 200))



  })
export { overlaySettingController }
