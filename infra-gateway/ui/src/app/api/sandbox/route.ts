import { NextResponse } from "next/server";

// In-memory persistent sandbox state for web dashboard
let activeSandboxes = [
  {
    sandboxId: "sbx-8f92a10",
    name: "integration-test-env-1",
    status: "active",
    namespace: "sandbox-sbx-8f92a10",
    isolatedNetwork: true,
    mockDependencies: ["redis", "postgres"],
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(activeSandboxes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `sbx-${Math.random().toString(16).substring(2, 9)}`;

    const newSandbox = {
      sandboxId: id,
      name: body.name || "sandbox-env",
      status: "active",
      namespace: `sandbox-${id}`,
      isolatedNetwork: Boolean(body.isolatedNetwork),
      mockDependencies: body.mockDependencies || ["redis"],
      createdAt: new Date().toISOString(),
    };

    activeSandboxes.push(newSandbox);
    return NextResponse.json(newSandbox, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing sandbox id" }, { status: 400 });
  }

  const initialLen = activeSandboxes.length;
  activeSandboxes = activeSandboxes.filter((s) => s.sandboxId !== id);

  return NextResponse.json({ success: activeSandboxes.length < initialLen });
}
