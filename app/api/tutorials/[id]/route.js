import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// GET: Ambil detail tutorial berdasarkan ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const {data: rows} = await supabase.from('tutorial_list').select('*').eq('id', id).limit(1).single();
    // // const [rows] = await supabase.from(
    // //   "SELECT * FROM `tutorial-list` WHERE id = ? LIMIT 1",
    // //   [id]
    // );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(rows || []);
  } catch (error) {
    console.error("Error fetching tutorial detail:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Perbarui tutorial berdasarkan ID (dukung update judul, kategori, level, deskripsi, command, & foto)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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

    // Handle jika user mengunggah screenshot baru
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

    // Format ulang langkah sebagai payload JSON
    const langkahData = JSON.stringify({
      deskripsi: String(deskripsi).trim(),
      command: String(command).trim(),
      imageUrl: String(imageUrl).trim(),
    });

    const {result} = await supabase.from('tutorial_list').update({title, kategori, level, langkah: langkahData}).eq('id', id);
    // const [result] = await supabase.from(
    //   "UPDATE `tutorial-list` SET title = ?, kategori = ?, level = ?, langkah = ? WHERE id = ?",
    //   [title.trim(), kategori, level, langkahData, id]
    // );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Tutorial berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating tutorial:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus tutorial berdasarkan ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const [result] = await supabase.from(
      "DELETE FROM `tutorial-list` WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Tutorial tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Tutorial berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting tutorial:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
