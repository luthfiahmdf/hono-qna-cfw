import { createRoute } from "@hono/zod-openapi";
import { requireAuth } from "../middleware/jwt";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { overlayParamsSchema, overlaySchema } from "../schemas/overlaySchema";
import { errorSchema } from "../schemas/errorSchema";

const updateOverlaySettings = createRoute({
  method: "put",
  path: "/:id",
  middleware: [requireAuth],
  request: {
    params: overlayParamsSchema,
    body: jsonContentRequired(overlaySchema.omit({ id: true, userId: true }), "create")
  },
  responses: {
    200: jsonContent(overlaySchema, "overlay Setting Created"),
    201: jsonContent(overlaySchema, "overlay updated"),
    400: jsonContent(errorSchema, "bad request")

  }

})

const getOverlaySettings = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: overlayParamsSchema
  },
  responses: {
    200: jsonContent(overlaySchema, "get Overlay getOverlaySettings")
  }
})
export { updateOverlaySettings, getOverlaySettings }
