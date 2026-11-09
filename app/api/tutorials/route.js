import { supabase } from "@/lib/supabase";
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tambah tutorial baru dengan upload screenshot & terminal command
export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const kategori = formData.get("kategori");
    const level = formData.get("level");
    const deskripsi = formData.get("deskripsi") || "";
    const command = formData.get("command") || "";
    let imageUrl = formData.get("imageUrl") || "";

    if (!title || !kategori || !level) {
      return NextResponse.json(
        { error: "Judul, kategori, dan level wajib diisi" },
        { status: 400 }
      );
    }

    // Handle upload file screenshot (jika ada file yang diunggah)
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
  } catch (error) {
    console.error("Error saving tutorial:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
