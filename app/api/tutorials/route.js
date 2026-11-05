import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { getServiceSupabase } from "@/lib/supabase";
import {
  deleteTutorialImage,
  isSupportedImage,
  MAX_TUTORIAL_IMAGE_SIZE,
  uploadTutorialImage,
} from "@/lib/tutorial-images";

export async function GET(request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await getServiceSupabase()
      .from("tutorial_list")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
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
    const deskripsi = String(formData.get("deskripsi") ?? "").trim();
    const command = String(formData.get("command") ?? "").trim();
    let imageUrl = String(formData.get("imageUrl") ?? "").trim();

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

    const langkah = JSON.stringify({ deskripsi, command, imageUrl });
    const { data, error } = await getServiceSupabase()
      .from("tutorial_list")
      .insert([{ title, kategori, level, langkah, suka: 0, tidak_suka: 0 }])
      .select("*")
      .single();

    if (error) throw error;
    saved = true;
    return NextResponse.json({ success: true, data }, { status: 201 });
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
