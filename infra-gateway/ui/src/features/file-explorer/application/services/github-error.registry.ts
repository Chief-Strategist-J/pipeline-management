import { NextResponse } from "next/server";

export interface StandardErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ErrorHandlerFn = (error: Error | string) => NextResponse;

export class GitHubErrorRegistry {
  private static registry = new Map<string, ErrorHandlerFn>();

  static {
    this.register("UNAUTHORIZED", (err) =>
      NextResponse.json(
        { success: false, error: String(err), code: "UNAUTHORIZED" },
        { status: 401 }
      )
    );

    this.register("BAD_REQUEST", (err) =>
      NextResponse.json(
        { success: false, error: String(err), code: "BAD_REQUEST" },
        { status: 400 }
      )
    );

    this.register("GITHUB_API_ERROR", (err) =>
      NextResponse.json(
        { success: false, error: String(err), code: "GITHUB_API_ERROR" },
        { status: 502 }
      )
    );

    this.register("INTERNAL_ERROR", (err) =>
      NextResponse.json(
        { success: false, error: String(err), code: "INTERNAL_ERROR" },
        { status: 500 }
      )
    );
  }

  public static register(code: string, handler: ErrorHandlerFn): void {
    this.registry.set(code, handler);
  }

  public static handle(code: string, error: Error | string): NextResponse {
    const handler = this.registry.get(code) || this.registry.get("INTERNAL_ERROR")!;
    return handler(error);
  }
}
