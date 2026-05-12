import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const cwd = process.cwd();
  const postsDirectory = path.join(cwd, "src/content/blog");

  try {
    const filenames = await fs.readdir(postsDirectory);
    return NextResponse.json({
      cwd,
      postsDirectory,
      filenames,
      count: filenames.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ cwd, postsDirectory, error: message }, { status: 500 });
  }
}
