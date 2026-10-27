import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectFiles, preserveProject, projectPath } from '../src/project-files.js';

test('code viewer reads source without executing it and explains omitted files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'code-viewer-test-'));
  const workspace = path.join(root, 'project');
  await mkdir(path.join(workspace, 'src'), { recursive: true });
  await mkdir(path.join(workspace, 'node_modules'));
  const source = 'console.log("hello");\n';
  await writeFile(path.join(workspace, 'src/main.ts'), source);
  await writeFile(path.join(workspace, 'README.md'), '<script>not executed</script>');
  await writeFile(path.join(workspace, '.env'), 'SECRET=private');
  await writeFile(path.join(workspace, 'binary'), Buffer.from([0, 1, 2]));
  await writeFile(path.join(workspace, 'big.txt'), 'a'.repeat(512001));
  await writeFile(path.join(root, 'outside.txt'), 'outside secret');
  await symlink(path.join(root, 'outside.txt'), path.join(workspace, 'linked.txt'));
  const result = await projectFiles(workspace);
  assert.deepEqual(result.files.map(f => f.name), ['README.md', 'src/main.ts']);
  assert.equal(result.files.find(f => f.name === 'src/main.ts').content, source);
  assert.equal(result.skipped.find(f => f.name === 'linked.txt').reason, 'Symbolic link');
  assert.ok(['.env', 'binary', 'big.txt', 'node_modules'].every(name => result.skipped.some(f => f.name === name)));
  await assert.rejects(projectFiles(path.join(root, 'missing')), /no longer available/);
});

test('saved projects survive workspace removal without following symlinks or losing hidden files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'saved-project-test-'));
  try {
    const workspace = path.join(root, 'workspace'), archive = path.join(root, 'project');
    await mkdir(workspace);
    await writeFile(path.join(workspace, 'main.py'), 'print(42)\n');
    await writeFile(path.join(workspace, '.config'), 'local config');
    await writeFile(path.join(root, 'private.txt'), 'outside data');
    await symlink(path.join(root, 'private.txt'), path.join(workspace, 'outside-link'));
    await symlink(root, path.join(workspace, 'loop'));
    const saved = await preserveProject(workspace, archive);
    assert.deepEqual(saved.omitted.sort(), ['loop', 'outside-link']);
    await rm(workspace, { recursive: true });
    const run = { workspace, savedProject: saved.path };
    assert.equal(projectPath(run), archive);
    assert.equal(projectPath({ workspace }), workspace);
    assert.equal(await readFile(path.join(archive, '.config'), 'utf8'), 'local config');
    const preview = await projectFiles(projectPath(run));
    assert.deepEqual(preview.files.map(f => f.name), ['main.py']);
    assert.equal(preview.files[0].content, 'print(42)\n');
    await assert.rejects(readFile(path.join(archive, 'outside-link')));
    await assert.rejects(preserveProject(workspace, path.join(root, 'missing-copy')));
    await assert.rejects(readFile(path.join(root, 'missing-copy')));
  } finally { await rm(root, { recursive: true, force: true }); }
});
