'use babel';
import { homedir } from 'os';
import * as Path from 'path';
import * as FS from 'fs';
import {
  copyFileToDir,
  openAndSetProjectDir,
  wait,
} from './helpers.js';
import rimraf from 'rimraf';
import linterEslintNode from '../lib/main.js';

const root = Path.normalize(homedir());
const paths = {
  eslint6: Path.join(root, 'with-eslint-6'),
  eslint7: Path.join(root, 'with-eslint-7'),
  eslintLatest: Path.join(root, 'with-eslint-latest'),
};

const fixtureRoot = Path.join(__dirname, 'fixtures', 'ci', 'package-interaction');

async function writeProjectConfig(projectPath, config) {
  const overrideFile = Path.join(projectPath, '.linter-eslint');
  const text = JSON.stringify(config, null, 2);
  FS.writeFileSync(overrideFile, text);
  await wait(1000);
}

async function copyFilesIntoProject(projectPath) {
  const files = [
    Path.join(fixtureRoot, '.eslintrc'),
    Path.join(fixtureRoot, 'index.js'),
  ];
  for (const file of files) {
    await copyFileToDir(file, projectPath);
  }
}

async function deleteFilesFromProject(projectPath) {
  const files = [
    Path.join(projectPath, '.eslintrc'),
    Path.join(projectPath, 'index.js'),
    Path.join(projectPath, '.linter-eslint'),
  ];
  for (const file of files) {
    await rimraf.sync(file);
  }
}

function expectVersionMatch(expected, actual) {
  expected = expected.replace(/\s/g, '');
  actual = actual.replace(/\s/g, '');
  expect(expected).toBe(actual);
}

if (process.env.CI != null) {
  xdescribe('Node binary config', () => {
    const linterProvider = linterEslintNode.provideLinter();
    const debugJob = linterEslintNode.debugJob.bind(linterEslintNode);
    const { lint } = linterProvider;

    beforeEach(async () => {
      atom.config.set('pulsar-eslint.nodeBin', process.env.NODE_DEFAULT);

      atom.packages.triggerDeferredActivationHooks();
      atom.packages.triggerActivationHook('core:loaded-shell-environment');

      await atom.packages.activatePackage('language-javascript');
      await atom.packages.activatePackage('pulsar-eslint');
    });

    describe('with default nodeBin', () => {
      let editor;
      beforeEach(async () => {
        await copyFilesIntoProject(paths.eslintLatest);
        editor = await openAndSetProjectDir(
          Path.join(paths.eslintLatest, 'index.js'),
          paths.eslintLatest,
        );
      });

      afterEach(async () => {
        await deleteFilesFromProject(paths.eslintLatest);
      });

      it('lints correctly', async () => {
        const results = await lint(editor);
        expect(results.length).toBe(1);
      });

      it('reports the correct version of Node', async () => {
        const debug = await debugJob(editor);
        expectVersionMatch(
          debug.nodeVersion,
          process.env.NODE_DEFAULT_VERSION,
        );
      });
    });

    describe('with project override', () => {
      let editor;

      beforeEach(async () => {
        await copyFilesIntoProject(paths.eslintLatest);
        editor = await openAndSetProjectDir(
          Path.join(paths.eslintLatest, 'index.js'),
          paths.eslintLatest,
        );
        await writeProjectConfig(paths.eslintLatest, {
          nodeBin: process.env.NODE_LATEST,
        });
      });

      afterEach(async () => {
        await deleteFilesFromProject(paths.eslintLatest);
      });

      it('lints correctly and using the right version of Node', async () => {
        const results = await lint(editor);
        expect(results.length).toBe(1);

        const debug = await debugJob(editor);
        expectVersionMatch(
          debug.nodeVersion,
          process.env.NODE_LATEST_VERSION,
        );
      });
    });

    describe('with config change after activation', () => {
      let editor;

      beforeEach(async () => {
        await copyFilesIntoProject(paths.eslintLatest);
        editor = await openAndSetProjectDir(
          Path.join(paths.eslintLatest, 'index.js'),
          paths.eslintLatest,
        );
      });

      afterEach(async () => {
        await deleteFilesFromProject(paths.eslintLatest);
      });

      it('lints correctly both before and after the version change', async () => {
        let debug = await debugJob(editor);
        expectVersionMatch(
          debug.nodeVersion,
          process.env.NODE_DEFAULT_VERSION,
        );

        let results = await lint(editor);
        expect(results.length).toBe(1);

        atom.config.set('pulsar-eslint.nodeBin', process.env.NODE_LATEST);
        wait(1000);

        debug = await debugJob(editor);
        expectVersionMatch(
          debug.nodeVersion,
          process.env.NODE_LATEST_VERSION,
        );

        results = await lint(editor);
        expect(results.length).toBe(1);
      });
    });
  });
}
