import { createRoute } from "@hono/zod-openapi";
import { paramsDashboardSchema, responseDashboardSchema } from "../schemas/dashboardDataSchema";
import { jsonContent } from "stoker/openapi/helpers";
import { requireAuth } from "../middleware/jwt";
import { errorSchema } from "../schemas/errorSchema";

const getDataDashboard = createRoute({
  path: "/:slug",
  middleware: [requireAuth],
  method: "get",
  request: {
    params: paramsDashboardSchema
  },
  responses: {
    200: jsonContent(responseDashboardSchema, "Data Dashboard"),
    404: jsonContent(errorSchema, "user not found")
  }
})
export { getDataDashboard }
