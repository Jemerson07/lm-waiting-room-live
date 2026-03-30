import { getSupabaseClient } from "@/lib/supabase";
import { isMaintenanceModeEnabled } from "@/lib/env";
import { registerMaintenanceAttachment } from "@/services/maintenance-attachments.service";

const DEFAULT_BUCKET = "maintenance-files";

function ensureEnabled() {
  if (!isMaintenanceModeEnabled()) {
    throw new Error("Modo manutenção desativado ou Supabase não configurado.");
  }
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function uploadMaintenanceAttachmentFromUrl(params: {
  orderId: string;
  sourceUrl: string;
  fileName: string;
  fileType?: string;
  bucketName?: string;
}) {
  ensureEnabled();

  const response = await fetch(params.sourceUrl);
  if (!response.ok) {
    throw new Error(`Falha ao baixar arquivo de origem: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const supabase = getSupabaseClient();
  const safeName = sanitizeFileName(params.fileName.trim());
  const path = `maintenance/${params.orderId}/${Date.now()}-${safeName}`;
  const contentType = params.fileType?.trim() || response.headers.get("content-type") || "application/octet-stream";
  const bucket = params.bucketName?.trim() || DEFAULT_BUCKET;

  const uploadResult = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadResult.error) throw uploadResult.error;

  const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(path);
  const filePath = publicUrlResult.data.publicUrl || path;

  const attachment = await registerMaintenanceAttachment({
    orderId: params.orderId,
    fileName: params.fileName,
    filePath,
    fileType: contentType,
  });

  return {
    attachment,
    storagePath: path,
    bucket,
    filePath,
  };
}
