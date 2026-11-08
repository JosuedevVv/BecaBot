import dns from "node:dns";
import { createClient } from "@insforge/sdk";

dns.setDefaultResultOrder("ipv4first");

const url = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL!;
const apiKey = process.env.INSFORGE_API_KEY!;

export const insforgeAdmin = createClient({
  baseUrl: url,
  anonKey: apiKey,
});
