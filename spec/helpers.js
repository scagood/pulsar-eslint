'use babel';

import * as path from 'path';
import * as fs from 'fs';
import { tmpdir } from 'os';

/**
 * Async helper to copy a file from one place to another on the filesystem.
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @param  {string} destinationDir  Directory to paste the file into
 * @return {Promise<string>}        path of the file in copy destination
 */
export function copyFileToDir(fileToCopyPath, destinationDir, newFileName = null) {
  return new Promise((resolve) => {
    const destinationPath = path.join(
      destinationDir,
      newFileName || path.basename(fileToCopyPath)
    );
    const ws = fs.createWriteStream(destinationPath);
    ws.on('close', () => resolve(destinationPath));
    fs.createReadStream(fileToCopyPath).pipe(ws);
  });
}

/**
 * Utility helper to copy a file into the OS temp directory.
 *
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @return {Promise<string>}        path of the file in copy destination
 */
// eslint-disable-next-line import/prefer-default-export
export async function copyFileToTempDir(fileToCopyPath, newFileName = null) {
  const tempFixtureDir = fs.mkdtempSync(tmpdir() + path.sep);
  return copyFileToDir(fileToCopyPath, tempFixtureDir, newFileName);
}

export async function openAndSetProjectDir (fileName, projectDir) {
  let editor = await atom.workspace.open(fileName);
  atom.project.setPaths([projectDir]);
  // Wait for the watcher to get setup before returning. This is a private API,
  // but it's way more precise than just waiting a fixed amouht of time.
  await atom.project.watcherPromisesByPath[projectDir];
  return editor;
}

// Grab this before it gets wrapped.
const _setTimeout = window.setTimeout;
export function wait (ms) {
  return new Promise((resolve) => {
    _setTimeout(resolve, ms);
  });
}

export function setTimeout (...args) {
  return _setTimeout(...args);
}
