import { getServiceSupabase } from "@/lib/supabase";

export const MAX_TUTORIAL_IMAGE_SIZE = 5 * 1024 * 1024;

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isSupportedImage(file) {
  return (
    file &&
    typeof file === "object" &&
    typeof file.arrayBuffer === "function" &&
    Number.isFinite(file.size) &&
    Boolean(imageExtensions[file.type])
  );
}

export async function uploadTutorialImage(file) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "tutorial-images";
  const objectName = `${crypto.randomUUID()}.${imageExtensions[file.type]}`;
  const storage = getServiceSupabase().storage.from(bucket);
  const { data, error } = await storage.upload(objectName, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Gagal mengunggah gambar ke Supabase Storage: ${error.message}`);
  }

  const { data: publicUrl } = storage.getPublicUrl(data.path);

  return publicUrl.publicUrl;
}

export async function deleteTutorialImage(imageUrl) {
  if (!imageUrl) return;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "tutorial-images";
  const { url } = getSupabaseUrl();
  const image = new URL(imageUrl);
  const supabaseOrigin = new URL(url).origin;
  const bucketPrefix = `/storage/v1/object/public/${bucket}/`;

  if (image.origin !== supabaseOrigin || !image.pathname.startsWith(bucketPrefix)) {
    return;
  }

  const objectName = decodeURIComponent(image.pathname.slice(bucketPrefix.length));
  const { error } = await getServiceSupabase().storage.from(bucket).remove([objectName]);

  if (error) {
    throw new Error(`Gagal menghapus gambar dari Supabase Storage: ${error.message}`);
  }
}

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL wajib dikonfigurasi.");
  return { url };
}
