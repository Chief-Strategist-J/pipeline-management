import { NextResponse } from "next/server";
import { connectToDatabase } from "@/core/database/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const creds = await db.collection("github_credentials").findOne({ key: "active_token" });

    if (creds) {
      return NextResponse.json({
        success: true,
        token: creds.token || "",
        repoName: creds.repoName || "",
        branchName: creds.branchName || "main",
        isPrivate: creds.isPrivate || false,
      });
    }

    return NextResponse.json({
      success: true,
      token: "",
      repoName: "",
      branchName: "main",
      isPrivate: false,
    });
  } catch {
    return NextResponse.json({
      success: true,
      token: "",
      repoName: "",
      branchName: "main",
      isPrivate: false,
    });
  }
}

export async function POST(req: Request) {
  try {
    const { token, repoName, branchName = "main", isPrivate = false } = await req.json();
    const { db } = await connectToDatabase();

    await db.collection("github_credentials").updateOne(
      { key: "active_token" },
      {
        $set: {
          key: "active_token",
          token,
          repoName,
          branchName,
          isPrivate,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "GitHub PAT Token saved to MongoDB." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
