import { NextResponse } from "next/server";
import { updateTask, deleteTask, isSheetsConfigured } from "@/lib/googleSheets";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body     = await req.json();
  const rowIndex = parseInt(params.id, 10);
  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" });
  }
  const ok = await updateTask(rowIndex, body);
  return NextResponse.json({ ok });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const rowIndex = parseInt(params.id, 10);
  if (!isSheetsConfigured()) {
    return NextResponse.json({ ok: true, source: "mock" });
  }
  const ok = await deleteTask(rowIndex);
  return NextResponse.json({ ok });
}
