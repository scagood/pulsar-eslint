'use babel';

import * as path from 'path';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { promisify } from 'node:util';

const wait = promisify(setTimeout);

/**
 * Async helper to copy a file from one place to another on the filesystem.
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @param  {string} destinationDir  Directory to paste the file into
 * @return {Promise<string>}        path of the file in copy destination
 */
export function copyFileToDir(fileToCopyPath, destinationDir, targetFileName = null) {
  return new Promise((resolve, reject) => {
    const destinationPath = path.join(
      destinationDir,
      targetFileName == null ? path.basename(fileToCopyPath) : targetFileName,
    );
    const rs = fs.createReadStream(fileToCopyPath);
    const ws = fs.createWriteStream(destinationPath);

    ws.on('close', () => resolve(destinationPath));
    ws.on('error', (error) => reject(error));

    rs.pipe(ws);
  });
}

/**
 * Utility helper to copy a file into the OS temp directory.
 *
 * @param  {string} fileToCopyPath  Path of the file to be copied
 * @return {Promise<string>}        path of the file in copy destination
 */
export async function copyFileToTempDir(fileToCopyPath, targetFileName = null) {
  const tempFixtureDir = fs.mkdtempSync(tmpdir() + path.sep);
  return copyFileToDir(fileToCopyPath, tempFixtureDir, targetFileName);
}

export async function openAndSetProjectDir(fileName, projectDir) {
  const editor = await atom.workspace.open(fileName);
  atom.project.setPaths([ projectDir ]);
  await Promise.race([
    atom.project.getWatcherPromise(projectDir),
    wait(1000),
  ]);
  return editor;
}

/**
 * @param {string} expectedMessage
 * @returns {Promise<import("atom").Notification>}
 */
export function getNotification(expectedMessage = null) {
  const promise = new Promise((resolve, reject) => {
    const notificationSub = atom.notifications.onDidAddNotification(
      (notification) => {
        if (expectedMessage == null) {
          return resolve(notification);
        }

        if (notification.getMessage() !== expectedMessage) {
          return;
        }

        if (notificationSub == null) {
          reject(new Error('Notification not found'));
        } else {
          notificationSub.dispose();
          resolve(notification);
        }
      },
    );
  });
  return Promise.race([ promise, wait(3000) ]);
}
