'use babel';
import { homedir } from 'os';
import * as Path from 'path';
import * as FS from 'fs';
import {
  copyFileToDir,
  getNotification,
  openAndSetProjectDir,
  // wait
} from './helpers.js';
import rimraf from 'rimraf';
import linterEslintNode from '../lib/main.js';

const root = Path.normalize(homedir());
const paths = {
  eslint6: Path.join(root, 'with-eslint-6'),
  eslint7: Path.join(root, 'with-eslint-7'),
  eslintLatest: Path.join(root, 'with-eslint-latest'),
};

const packagesRoot = Path.join(root, '.pulsar', 'packages');
const fixtureRoot = Path.join(__dirname, 'fixtures', 'ci', 'package-interaction');

async function expectNoNotification(fn) {
  const notificationPromise = getNotification();
  await fn();
  const notification = await notificationPromise;
  expect(notification).toBe(undefined);
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
  ];
  for (const file of files) {
    await rimraf.sync(file);
  }
}

if (process.env.CI != null) {
  xdescribe('Package interaction', () => {
    const linterProvider = linterEslintNode.provideLinter();
    const { lint } = linterProvider;

    beforeEach(async () => {
      atom.config.set('pulsar-eslint.nodeBin', process.env.NODE_DEFAULT);

      atom.packages.triggerDeferredActivationHooks();
      atom.packages.triggerActivationHook('core:loaded-shell-environment');

      await atom.packages.loadPackage(
        Path.join(packagesRoot, 'linter-eslint'),
      );

      await atom.packages.activatePackage('language-javascript');
      await atom.packages.activatePackage('pulsar-eslint');
    });

    describe('With linter-eslint enabled', () => {
      beforeEach(async () => {
        await atom.packages.activatePackage('linter-eslint');
      });

      it('should do nothing when opening an ESLint@6 project', async () => {
        await copyFilesIntoProject(paths.eslint6);
        expect(FS.existsSync(Path.join(paths.eslint6, 'index.js'))).toBe(true);
        const editor = await openAndSetProjectDir(
          Path.join(paths.eslint6, 'index.js'),
          paths.eslint6,
        );

        await expectNoNotification(async () => {
          const results = await lint(editor);
          expect(results).toBe(null);
        });

        await deleteFilesFromProject(paths.eslint6);
      });

      it('should do nothing when opening an ESLint@7 project', async () => {
        await copyFilesIntoProject(paths.eslint7);
        const editor = await openAndSetProjectDir(
          Path.join(paths.eslint7, 'index.js'),
          paths.eslint7,
        );

        await expectNoNotification(async () => {
          const results = await lint(editor);
          expect(results).toBe(null);
        });

        await deleteFilesFromProject(paths.eslint7);
      });

      it('should lint when opening an ESLint@8 project', async () => {
        await copyFilesIntoProject(paths.eslintLatest);
        const editor = await openAndSetProjectDir(
          Path.join(paths.eslintLatest, 'index.js'),
          paths.eslintLatest,
        );

        await expectNoNotification(async () => {
          const results = await lint(editor);
          expect(results.length).toBe(1);
        });
        await deleteFilesFromProject(paths.eslintLatest);
      });
    });

    describe('With linter-eslint disabled', () => {
      beforeEach(async () => {
        await atom.packages.deactivatePackage('linter-eslint');
      });

      it('should prompt to install linter-eslint when opening an ESLint@6 project', async () => {
        await copyFilesIntoProject(paths.eslint6);
        const editor = await openAndSetProjectDir(
          Path.join(paths.eslint6, 'index.js'),
          paths.eslint6,
        );

        const notificationPromise = getNotification();
        const results = await lint(editor);
        expect(results).toBe(null);
        const notification = await notificationPromise;

        if (notification == null) {
          fail('Did not get notification');
        } else {
          expect(notification.getMessage()).toBe('pulsar-eslint: Incompatible ESLint');
        }
        await deleteFilesFromProject(paths.eslint6);
      });

      it('should prompt to install linter-eslint when opening an ESLint@7 project', async () => {
        await copyFilesIntoProject(paths.eslint7);
        const editor = await openAndSetProjectDir(
          Path.join(paths.eslint7, 'index.js'),
          paths.eslint7,
        );

        const notificationPromise = getNotification();
        const results = await lint(editor);
        expect(results).toBe(null);
        const notification = await notificationPromise;

        if (notification == null) {
          fail('Did not get notification');
        } else {
          expect(notification.getMessage()).toBe('pulsar-eslint: Incompatible ESLint');
        }

        await deleteFilesFromProject(paths.eslint7);
      });

      it('should lint when opening an ESLint@8 project', async () => {
        await copyFilesIntoProject(paths.eslintLatest);
        const editor = await openAndSetProjectDir(
          Path.join(paths.eslintLatest, 'index.js'),
          paths.eslintLatest,
        );

        await expectNoNotification(async () => {
          const results = await lint(editor);
          expect(results.length).toBe(1);
        });
        await deleteFilesFromProject(paths.eslintLatest);
      });
    });
  });
}
