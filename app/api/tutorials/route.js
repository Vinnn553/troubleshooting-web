import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";


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
    if (file && typeof file === "object" && file.size > 0 && typeof file.arrayBuffer === "function") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const extension = path.extname(file.name) || ".png";
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;
      const filePath = path.join(uploadDir, cleanFileName);

      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${cleanFileName}`;
    }

    // Simpan langkah sebagai data terstruktur (JSON)
    const langkahData = JSON.stringify({
      deskripsi: String(deskripsi).trim(),
      command: String(command).trim(),
      imageUrl: String(imageUrl).trim(),
    });

    const { data: result, error } = await supabase.from('tutorial_list')
                            .insert([{ title: title, kategori: kategori, level: level, langkah: langkahData, suka: 0, tidak_suka: 0 }]);

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
