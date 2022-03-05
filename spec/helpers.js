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
export function copyFileToDir(fileToCopyPath, destinationDir) {
  return new Promise((resolve) => {
    const destinationPath = path.join(destinationDir, path.basename(fileToCopyPath));
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
export async function copyFileToTempDir(fileToCopyPath) {
  const tempFixtureDir = fs.mkdtempSync(tmpdir() + path.sep);
  return copyFileToDir(fileToCopyPath, tempFixtureDir);
}

export async function openAndSetProjectDir (fileName, projectDir) {
  let editor = await atom.workspace.open(fileName);
  atom.project.setPaths([projectDir]);
  return editor;
}
