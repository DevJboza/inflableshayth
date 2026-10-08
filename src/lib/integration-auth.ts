import { safeEqual } from "@/lib/auth";
export function integrationAllowed(req: Request) {
  const supplied = req.headers.get("x-integration-secret") || "",
    expected = process.env.N8N_INTEGRATION_SECRET || "";
  return Boolean(expected) && safeEqual(supplied, expected);
}
