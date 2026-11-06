import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return NextResponse.json(
      { error: "ID tutorial tidak valid." },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request feedback tidak valid." },
      { status: 400 }
    );
  }

  if (!["suka", "tidak_suka"].includes(body?.type)) {
    return NextResponse.json(
      { error: "Jenis feedback tidak valid." },
      { status: 400 }
    );
  }

  const { data, error } = await getServiceSupabase().rpc(
    "increment_tutorial_feedback",
    {
      p_tutorial_id: Number(id),
      p_feedback_type: body.type,
    }
  );

  if (error) {
    console.error("Gagal menyimpan feedback tutorial:", error);
    return NextResponse.json(
      { error: "Feedback gagal disimpan." },
      { status: 500 }
    );
  }

  const counts = Array.isArray(data) ? data[0] : data;

  if (!counts) {
    return NextResponse.json(
      { error: "Tutorial tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json(counts);
}