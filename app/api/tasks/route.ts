import { NextResponse } from "next/server";
import { getTasks, appendTask, isSheetsConfigured } from "@/lib/googleSheets";
import { MOCK_TASKS } from "@/lib/mockData";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ source: "mock", tasks: MOCK_TASKS });
  }
  const tasks = await getTasks();
  if (!tasks) {
    return NextResponse.json(
      { source: "mock", tasks: MOCK_TASKS, warning: "Sheets fetch failed, using mock data" }
    );
  }
  return NextResponse.json({ source: "sheets", tasks });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!isSheetsConfigured()) {
    const newTask = { ...body, id: String(Date.now()), status: "pending", createdAt: new Date().toISOString().split("T")[0] };
    return NextResponse.json({ ok: true, source: "mock", task: newTask });
  }
  const result = await appendTask(body);
  if (!result) return NextResponse.json({ ok: false, error: "Sheets write failed" }, { status: 500 });
  return NextResponse.json({ ok: true, source: "sheets", rowIndex: result.rowIndex });
}
