'use babel';

import { resolve } from 'path';
import { readdir, readFile } from 'fs/promises';

import { listParents, findUp } from '../filesystem.js';

const CONFIG_FILE_ORDER = [
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.yaml',
  '.eslintrc.yml',
  '.eslintrc.json',
  'package.json',
];

const CONFIG_FILE_ORDER_9 = [
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.mjs',
  'eslint.config.ts',
  'eslint.config.cts',
  'eslint.config.mts',
];

async function isESLintPackageJson(path) {
  console.info(`Checking for eslint config in: ${path}`);
  return false;
}

/**
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
async function getV8Config(filePath) {
  let highestDirectory = null;
  for (const directory of listParents(filePath)) {
    const ls = (await readdir(directory, { withFileTypes: true }))
      .filter((file) => file.isFile())
      .map((file) => file.name);

    const lsSet = new Set(ls);

    const config = CONFIG_FILE_ORDER
      .find((file) => lsSet.has(file));

    if (config == null) {
      continue;
    }

    const path = resolve(directory, config);

    if (
      config === 'package.json' &&
      (await isESLintPackageJson(path)) !== true
    ) {
      continue;
    }

    /*
     * Hacky "root: true" check
     */
    const content = await readFile(path, { encoding: 'utf8', flag: 'r' });

    /*
     * Does not work when "root: true" is commented...
     * Probably need to parse the file correctly :(
     */
    if ((/(["'`]?)root\1:\s*true/).test(content)) {
      return path;
    }

    highestDirectory = path;
  }

  return highestDirectory;
}

/**
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
async function getV9Config(filePath) {
  // Search up for eslint.config.js
  for (const configName of CONFIG_FILE_ORDER_9) {
    const config = await findUp(filePath, configName);
    if (config != null) {
      return config;
    }
  }

  return null;
}

/**
 * Get the best cwd for the linted file.
 * @param {string} filePath
 * @param {string} eslintVersion
 * @param {import('../../types.js').Config} config
 * @returns {Promise<string|null>}
 */
export async function getESLintConfig(filePath, eslintVersion, config) {
  console.debug(`Looking for config for ESLint: ${eslintVersion}`, config);
  if (typeof eslintVersion !== 'string') {
    return null;
  }

  if (typeof config?.eslintLocation?.overrideESLintConfig === 'string') {
    return config.eslintLocation.overrideESLintConfig;
  }

  const [ majorText ] = eslintVersion.split('.');
  const major = Number.parseInt(majorText, 10);

  if (major <= 7) {
    return await getV8Config(filePath);
  }

  if (major <= 8) {
    return (
      await getV8Config(filePath) ??
      await getV9Config(filePath)
    );
  }

  return await getV9Config(filePath);
}

/**
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
export async function getESLintIgnore(filePath) {
  // Search up for eslint.config.js
  return await findUp(filePath, '.eslintignore');
}
