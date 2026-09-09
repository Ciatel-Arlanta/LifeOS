/**
 * Saving and picking text files. Web preview uses a download anchor and a hidden file
 * input; `files.native.ts` uses the Android storage picker.
 */
export async function saveTextFile(
  fileName: string,
  mimeType: string,
  contents: string
): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function pickTextFile(mimeType: string): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mimeType;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      void file.text().then(resolve);
    };
    input.oncancel = () => {
      resolve(null);
    };
    input.click();
  });
}
