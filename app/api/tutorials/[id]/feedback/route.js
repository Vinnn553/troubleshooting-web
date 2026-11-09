import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  try {
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

    const db = getServiceSupabase();

    // 1. Coba lewat RPC function jika sudah dibuat di Supabase
    try {
      const { data: rpcData, error: rpcError } = await db.rpc(
        "increment_tutorial_feedback",
        {
          p_tutorial_id: Number(id),
          p_feedback_type: body.type,
        }
      );

      if (!rpcError && rpcData) {
        const counts = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        return NextResponse.json(counts);
      }
    } catch (rpcErr) {
      console.warn("RPC feedback gagal, beralih ke fallback langsung:", rpcErr);
    }

    // 2. Fallback: Update langsung ke tabel tutorial_list
    const { data: current, error: fetchError } = await db
      .from("tutorial_list")
      .select("suka, tidak_suka")
      .eq("id", Number(id))
      .maybeSingle();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: "Tutorial tidak ditemukan." },
        { status: 404 }
      );
    }

    const newSuka = body.type === "suka" ? Number(current.suka || 0) + 1 : Number(current.suka || 0);
    const newTidakSuka = body.type === "tidak_suka" ? Number(current.tidak_suka || 0) + 1 : Number(current.tidak_suka || 0);

    const { error: updateError } = await db
      .from("tutorial_list")
      .update({ suka: newSuka, tidak_suka: newTidakSuka })
      .eq("id", Number(id));

    if (updateError) {
      console.error("Gagal mengupdate feedback fallback:", updateError);
      return NextResponse.json(
        { error: "Feedback gagal disimpan." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tutorialId: Number(id),
      suka: newSuka,
      tidak_suka: newTidakSuka,
    });
  } catch (error) {
    console.error("Error pada endpoint feedback tutorial:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan feedback." },
      { status: 500 }
    );
  }
}
