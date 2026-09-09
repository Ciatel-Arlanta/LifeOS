import { File } from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system/legacy';

/**
 * Native counterpart of `files.ts`.
 *
 * Saving goes through the Storage Access Framework so the user chooses the folder
 * (Downloads, Drive, …) and the file lands somewhere they can reach — an app-sandbox
 * path would be useless as a backup. Returns false when the folder prompt is dismissed.
 */
export async function saveTextFile(
  fileName: string,
  mimeType: string,
  contents: string
): Promise<boolean> {
  const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return false;
  const uri = await StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    fileName,
    mimeType
  );
  await StorageAccessFramework.writeAsStringAsync(uri, contents);
  return true;
}

export async function pickTextFile(mimeType: string): Promise<string | null> {
  const result = await File.pickFileAsync({ mimeTypes: [mimeType, 'application/octet-stream'] });
  if (result.canceled) return null;
  return result.result.text();
}
