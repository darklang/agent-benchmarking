import { lstat, readdir, readFile, realpath, cp, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { redact } from './storage.js';

// Show source as text, never execute it or follow links outside the project.
export async function projectFiles(workspace) {
  if (!workspace) throw Error('This attempt has no project folder.');
  let root;
  try { root = await realpath(workspace); } catch { throw Error('The project folder is no longer available on disk.'); }
  const files = [], skipped = [];
  let bytes = 0;
  async function visit(folder) {
    for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(folder, entry.name), name = path.relative(root, target);
      if (entry.name.startsWith('.') || ['node_modules', '__pycache__', 'vendor'].includes(entry.name)) {
        skipped.push({ name, reason: 'Hidden file or dependency folder' }); continue;
      }
      const info = await lstat(target);
      if (info.isSymbolicLink()) { skipped.push({ name, reason: 'Symbolic link' }); continue; }
      if (info.isDirectory()) { await visit(target); continue; }
      if (!info.isFile()) continue;
      if (files.length >= 200 || info.size > 512000 || bytes + info.size > 2000000) {
        skipped.push({ name, reason: 'Preview size limit' }); continue;
      }
      const content = await readFile(target);
      let text;
      try {
        if (content.includes(0)) throw Error('binary');
        text = new TextDecoder('utf-8', { fatal: true }).decode(content);
      } catch { skipped.push({ name, reason: 'Binary or non-UTF-8 file' }); continue; }
      bytes += content.length;
      files.push({ name, content: redact(text) });
    }
  }
  await visit(root);
  return { files, skipped, workspace: root };
}

// Preserve regular files without following links into unrelated folders.
export async function preserveProject(workspace, destination) {
  const staging = `${destination}.tmp`;
  const omitted = [];
  try {
    await cp(workspace, staging, { recursive: true, dereference: false, filter: async source => {
      const info = await lstat(source);
      if (info.isDirectory() || info.isFile()) return true;
      omitted.push(path.relative(workspace, source));
      return false;
    } });
    await rename(staging, destination);
    return { path: destination, omitted };
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

export const projectPath = run => run.savedProject || run.workspace;
