'use babel';

// eslint-disable-next-line n/no-process-env
const { NVM_DIR } = process.env;

import { readFile } from 'fs/promises';
import { homedir, platform } from 'os';
import { resolve } from 'path';

import { exists, findUp } from '../filesystem.js';

/**
 * @param {string} filePath
 * @param {import('../../types.js').Config} config
 * @returns {Promise<string>}
 */
export default async function loaderNvm(filePath, config) {
  if (platform() === 'win32') {
    return;
  }

  const nvmDir = (
    config?.nodeLocation?.nvmDir ??
    NVM_DIR ??
    resolve(homedir(), '.nvm')
  );

  if (await exists(nvmDir) === false) {
    return;
  }

  const nvmrc = await findUp(filePath, '.nvmrc');
  if (typeof nvmrc !== 'string') {
    return;
  }

  // TODO: Call something like node-version-alias to resolve the version correctly
  const version = await readFile(nvmrc, { encoding: 'utf8' });
  return resolve(
    nvmDir,
    'versions',
    'node',
    version.trim(),
    'bin',
    'node',
  );
}
