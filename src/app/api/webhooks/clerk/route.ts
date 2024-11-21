import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Role } from "~/hooks/useRole";
import { env } from "~/env";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = (await req.json()) as unknown;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(env.WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, public_metadata, username } = evt.data;
    // Create the user in your database
    await db.insert(users).values({
      clerkId: id as string,
      email: email_addresses[0]?.email_address ?? "", // Ensure email is not undefined
      nickname: username ?? null, // Use null instead of undefined
      role: (public_metadata.role as Role) ?? "worker", // Default to worker if no role specified
    });
  }

  // Handle role updates
  if (eventType === "user.updated") {
    const { id, public_metadata } = evt.data;

    if (public_metadata.role) {
      await db
        .update(users)
        .set({
          role: public_metadata.role as Role,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));
    }
  }

  return new Response("", { status: 200 });
}
