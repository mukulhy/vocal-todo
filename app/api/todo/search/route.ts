import Fuse from "fuse.js";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { content } = await req.json();

  const todos = await prisma.todo.findMany({
    where: { deletedAt: null },
  });

  const fuse = new Fuse(todos, {
    keys: ["content"],
    threshold: 0.4,
  });

  const result = fuse.search(content);
  if (!result.length) {
    return NextResponse.json({
      status: "error",
      message: "No match found",
      data: null,
    });
  }

  const matched = result[0].item;

  return NextResponse.json({
    status: "success",
    message: "Found best match",
    data: matched,
  });
}
