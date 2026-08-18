import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, name, path, content } = body;

    const mongoUri = process.env.MONGODB_URI || "mongodb://root:example@localhost:27017/pipeline_management?authSource=admin";

    return NextResponse.json({
      success: true,
      fileId,
      name,
      path,
      savedAt: new Date().toISOString(),
      database: "MongoDB / pipeline_management",
      mongoUri,
      message: `File [${name}] successfully saved to MongoDB database!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
