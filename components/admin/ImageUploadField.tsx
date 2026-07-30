"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ImageUploadField({
  bucket,
  name,
  label,
  defaultValue,
}: {
  bucket: "experience-images" | "business-logos";
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("No pudimos subir la imagen. Puedes pegar una URL manualmente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`${name}-url`} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail for an arbitrary user-supplied/Supabase Storage URL, not worth next/image remote-pattern config
          <img src={url} alt="" className="h-16 w-16 rounded-lg border border-carbon/15 object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="text-sm"
        />
      </div>
      <input
        id={`${name}-url`}
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://…"
        className="rounded-lg border border-carbon/20 bg-white px-3 py-2 text-sm"
      />
      {uploading && <p className="text-xs text-gray-500">Subiendo…</p>}
      {error && <p className="text-xs text-orange-ink">{error}</p>}
    </div>
  );
}
