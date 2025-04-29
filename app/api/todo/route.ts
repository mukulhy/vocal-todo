import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      status: "success",
      message: "Todos fetched successfully",
      data: todos,
    });
  } catch (error) {
    console.log("Error In Get Todo", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch todos",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json(
        {
          status: "error",
          message: "Content is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({ data: { content } });
    return NextResponse.json(
      {
        status: "success",
        message: "Todo created successfully",
        data: todo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error In Post Todo", error);
    
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create todo",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, content } = await req.json();
    if (!id || !content) {
      return NextResponse.json(
        {
          status: "error",
          message: "ID and content are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: { content, updatedAt: new Date() },
    });
    return NextResponse.json({
      status: "success",
      message: "Todo updated successfully",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update todo",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Content is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const deleted = await prisma.todo.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({
      status: "success",
      message: "Todo(s) deleted successfully",
      data: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete todo",
        data: null,
      },
      { status: 500 }
    );
  }
}
