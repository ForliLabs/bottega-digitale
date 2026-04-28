// OpenAPI Specification Endpoint
import { generateOpenAPISpec } from "@/lib/webhook-api";

export async function GET() {
  const spec = generateOpenAPISpec();
  return Response.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
