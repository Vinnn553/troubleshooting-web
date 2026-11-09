import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { getServiceSupabase } from "@/lib/supabase";
import { parseSubmittedSteps } from "@/lib/tutorial-content";
import {
  deleteTutorialImage,
  isSupportedImage,
  MAX_TUTORIAL_IMAGE_SIZE,
  uploadTutorialImage,
} from "@/lib/tutorial-images";

<<<<<<< HEAD
export async function GET(request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await getServiceSupabase()
      .from("tutorial_list")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
=======
// GET: Ambil semua data tutorial dari database
export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from('tutorial_list')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Error fetching tutorials:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(rows || []);
>>>>>>> development
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil tutorial." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let uploadedImageUrl = "";
  let saved = false;

  try {
    if (!(await isAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const kategori = String(formData.get("kategori") ?? "").trim();
    const level = String(formData.get("level") ?? "").trim();
    let imageUrl = String(formData.get("imageUrl") ?? "").trim();
    let steps;

    try {
      steps = parseSubmittedSteps(formData);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!title || !kategori || !level) {
      return NextResponse.json(
        { error: "Judul, kategori, dan level wajib diisi." },
        { status: 400 }
      );
    }

    const file = formData.get("image");
    if (file && typeof file === "object" && file.size > 0) {
      if (file.size > MAX_TUTORIAL_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Ukuran gambar maksimal 5 MB." },
          { status: 413 }
        );
      }
      if (!isSupportedImage(file)) {
        return NextResponse.json(
          { error: "Format gambar harus JPEG, PNG, WebP, atau GIF." },
          { status: 415 }
        );
      }
      imageUrl = await uploadTutorialImage(file);
      uploadedImageUrl = imageUrl;
    }

    const deskripsi = steps.map((step) => step.description).filter(Boolean).join("\n\n");
    const command = steps.map((step) => step.command).filter(Boolean).join("\n");
    const langkah = JSON.stringify({ steps, deskripsi, command, imageUrl });
    const { data, error } = await getServiceSupabase()
      .from("tutorial_list")
      .insert([{ title, kategori, level, langkah, suka: 0, tidak_suka: 0 }])
      .select("*")
      .single();

<<<<<<< HEAD
    if (error) throw error;
    saved = true;
    return NextResponse.json({ success: true, data }, { status: 201 });
=======
    const { data: insertedRows, error } = await supabase
      .from('tutorial_list')
      .insert([{
        title: title.trim(),
        kategori,
        level,
        langkah: langkahData,
        suka: 0,
        tidak_suka: 0,
      }])
      .select();

    if (error) {
      console.error("Error saving tutorial:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const inserted = insertedRows?.[0];

    return NextResponse.json({
      success: true,
      data: {
        id: inserted?.id,
        title: title.trim(),
        kategori,
        level,
        langkah: langkahData,
        suka: 0,
        tidak_suka: 0,
      },
    });
>>>>>>> development
  } catch (error) {
    if (uploadedImageUrl && !saved) {
      try {
        await deleteTutorialImage(uploadedImageUrl);
      } catch (cleanupError) {
        console.error("Gambar unggahan yang gagal disimpan tidak dapat dibersihkan:", cleanupError);
      }
    }

    console.error("Error saving tutorial:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan tutorial." },
      { status: 500 }
    );
  }
}
