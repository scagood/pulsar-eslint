'use babel';

import { checkNodeBin } from './resolve-check-bin.js';

import loaderNvm from './loader-nvm.js';

/**
 * @param {string} filePath
 * @param {import('../../types.js').Config} config
 * @returns {Promise<string>}
 */
export async function resolveNodeBin(filePath, config) {
  if (typeof config?.nodeLocation?.overrideNodeExecutable === 'string') {
    return checkNodeBin(config.nodeLocation.overrideNodeExecutable);
  }

  if (config?.advanced?.allowNvmLoader === true) {
    const bin = await loaderNvm(filePath, config);

    if (typeof bin === 'string') {
      const resolved = await checkNodeBin(bin);
      if (typeof resolved === 'string') {
        return resolved;
      }

      throw Object.assign(
        new Error('Loader path provided, but binary not found'),
        { path: bin },
      );
    }
  }

  // Check for $(which node)
  return checkNodeBin('node');
}
