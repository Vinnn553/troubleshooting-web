import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { getServiceSupabase } from "@/lib/supabase";
import {
  deleteTutorialImage,
  isSupportedImage,
  MAX_TUTORIAL_IMAGE_SIZE,
  uploadTutorialImage,
} from "@/lib/tutorial-images";

function getImageUrl(langkah) {
  try {
    const parsed = typeof langkah === "string" ? JSON.parse(langkah) : langkah;
    return parsed?.imageUrl || parsed?.gambar || "";
  } catch {
    return "";
  }
}

async function getTutorialId(params) {
  const { id } = await params;
  return /^\d+$/.test(id) ? id : null;
}

export async function GET(request, { params }) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = await getTutorialId(params);
    if (!id) {
      return NextResponse.json({ error: "ID tutorial tidak valid." }, { status: 400 });
    }

    const { data, error } = await getServiceSupabase()
      .from("tutorial_list")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tutorial detail:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil detail tutorial." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  let uploadedImageUrl = "";
  let saved = false;

  try {
    if (!(await isAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = await getTutorialId(params);
    if (!id) {
      return NextResponse.json({ error: "ID tutorial tidak valid." }, { status: 400 });
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

    const { data: current, error: currentError } = await getServiceSupabase()
      .from("tutorial_list")
      .select("id, langkah")
      .eq("id", id)
      .maybeSingle();

    if (currentError) throw currentError;
    if (!current) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan." }, { status: 404 });
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
      .update({ title, kategori, level, langkah })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan." }, { status: 404 });
    }
    saved = true;

    let warning;
    const oldImageUrl = getImageUrl(current.langkah);
    if (uploadedImageUrl && oldImageUrl && oldImageUrl !== uploadedImageUrl) {
      try {
        await deleteTutorialImage(oldImageUrl);
      } catch (cleanupError) {
        console.error("Gambar lama tidak dapat dihapus:", cleanupError);
        warning = "Tutorial tersimpan, tetapi gambar lama gagal dihapus.";
      }
    }

    return NextResponse.json({
      success: true,
      data,
      ...(warning ? { warning } : {}),
    });
  } catch (error) {
    if (uploadedImageUrl && !saved) {
      try {
        await deleteTutorialImage(uploadedImageUrl);
      } catch (cleanupError) {
        console.error("Gambar unggahan yang gagal disimpan tidak dapat dibersihkan:", cleanupError);
      }
    }

    console.error("Error updating tutorial:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui tutorial." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = await getTutorialId(params);
    if (!id) {
      return NextResponse.json({ error: "ID tutorial tidak valid." }, { status: 400 });
    }

    const { data, error } = await getServiceSupabase()
      .from("tutorial_list")
      .delete()
      .eq("id", id)
      .select("id, langkah")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan." }, { status: 404 });
    }

    let warning;
    try {
      await deleteTutorialImage(getImageUrl(data.langkah));
    } catch (cleanupError) {
      console.error("Tutorial terhapus, tetapi gambarnya gagal dihapus:", cleanupError);
      warning = "Tutorial terhapus, tetapi gambar gagal dihapus.";
    }

    return NextResponse.json({
      success: true,
      message: "Tutorial berhasil dihapus.",
      ...(warning ? { warning } : {}),
    });
  } catch (error) {
    console.error("Error deleting tutorial:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus tutorial." },
      { status: 500 }
    );
  }
}
