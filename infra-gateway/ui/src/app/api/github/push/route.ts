import { NextResponse } from "next/server";
import { GitHubPushService } from "@/features/file-explorer/application/services/github-push.service";
import { GitHubErrorRegistry } from "@/features/file-explorer/application/services/github-error.registry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return await GitHubPushService.executePush(body);
  } catch (err: any) {
    return GitHubErrorRegistry.handle("INTERNAL_ERROR", err.message || "Failed to execute GitHub push pipeline.");
  }
}
