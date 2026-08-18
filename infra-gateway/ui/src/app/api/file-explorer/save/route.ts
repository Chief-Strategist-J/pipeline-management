import { NextResponse } from "next/server";
import { connectToDatabase } from "@/core/database/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, name, path, content } = body;

    const { db } = await connectToDatabase();

    await db.collection("saved_files").updateOne(
      { fileId },
      {
        $set: {
          fileId,
          name,
          path,
          content,
          savedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      fileId,
      name,
      path,
      savedAt: new Date().toISOString(),
      database: "MongoDB / pipeline_management",
      message: `File [${name}] successfully saved to MongoDB database!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
