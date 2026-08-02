const os = require('os');
const fs = require('fs');
const path = require('path');

const parser = require('@typescript-eslint/parser');

const rule = require('../prefer-relative-self-slice-import/prefer-relative-self-slice-import');

const writeFile = (filename, content) => {
  fs.mkdirSync(path.dirname(filename), {
    recursive: true,
  });

  fs.writeFileSync(filename, content, 'utf8');
};

const testRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'prefer-relative-self-slice-import-')
);

const sourceRoot = path.join(testRoot, 'src');

const writeFixture = (relativeFilename, content) => {
  const filename = path.join(sourceRoot, relativeFilename);

  fs.mkdirSync(path.dirname(filename), {
    recursive: true,
  });

  fs.writeFileSync(filename, content, 'utf8');

  return filename;
};

const runRule = ({ filename, code }) => {
  const program = parser.parse(code, {
    ecmaVersion: 2022,
    sourceType: 'module',
    range: true,
  });

  const node = program.body.find(
    (statement) => statement.type === 'ImportDeclaration'
  );

  if (!node) {
    throw new Error('Test source has no import declaration.');
  }

  const reports = [];

  const sourceCode = {
    getText(targetNode) {
      return code.slice(targetNode.range[0], targetNode.range[1]);
    },
  };

  const context = {
    options: [
      {
        srcDir: sourceRoot,
      },
    ],

    getPhysicalFilename() {
      return filename;
    },

    getFilename() {
      return filename;
    },

    getCwd() {
      return process.cwd();
    },

    getSourceCode() {
      return sourceCode;
    },

    report(report) {
      let output = null;

      if (report.fix) {
        const fix = report.fix({
          replaceText(targetNode, replacement) {
            return {
              range: targetNode.range,
              text: replacement,
            };
          },
        });

        output =
          code.slice(0, fix.range[0]) + fix.text + code.slice(fix.range[1]);
      }

      reports.push({
        messageId: report.messageId,
        data: report.data,
        output,
      });
    },
  };

  const visitors = rule.create(context);

  visitors.ImportDeclaration(node);

  return reports;
};

beforeAll(() => {
  writeFixture(
    'features/diary/model/hooks/usePhotoViewer.ts',
    [
      'const usePhotoViewer = () => {};',
      '',
      'export default usePhotoViewer;',
      '',
    ].join('\n')
  );

  writeFixture(
    'features/diary/model/hooks/index.ts',
    [
      'export {',
      '  default as usePhotoViewer,',
      "} from './usePhotoViewer';",
      '',
    ].join('\n')
  );

  writeFixture(
    'features/diary/model/types/Entry.ts',
    ['export interface Entry {', '  id: string;', '}', ''].join('\n')
  );

  writeFixture(
    'features/diary/model/types/index.ts',
    ["export * from './Entry';", ''].join('\n')
  );

  writeFixture(
    'features/diary/model/values/alpha.ts',
    ["const alpha = 'alpha';", '', 'export default alpha;', ''].join('\n')
  );

  writeFixture(
    'features/diary/model/values/beta.ts',
    ["export const beta = 'beta';", ''].join('\n')
  );

  writeFixture(
    'features/diary/model/values/index.ts',
    [
      'export {',
      '  default as alpha,',
      "} from './alpha';",
      '',
      'export {',
      '  beta,',
      "} from './beta';",
      '',
    ].join('\n')
  );

  writeFixture(
    'features/diary/model/setup.ts',
    'globalThis.diarySetup = true;\n'
  );

  writeFixture('features/diary/model/cycle/a.ts', "export * from './b';\n");

  writeFixture('features/diary/model/cycle/b.ts', "export * from './a';\n");

  writeFixture(
    'features/diary/styles/Switcher.ts',
    ['export const root = {};', ''].join('\n')
  );

  writeFixture(
    'features/diary/i18n/en.json',
    JSON.stringify({
      diary: 'Diary',
    })
  );

  writeFixture(
    'features/theme/index.ts',
    ['export const theme = {};', ''].join('\n')
  );
});

afterAll(() => {
  fs.rmSync(testRoot, {
    recursive: true,
    force: true,
  });
});

describe('prefer-relative-self-slice-import', () => {
  const componentFilename = path.join(
    sourceRoot,
    'features/diary/ui/DiaryEntryCard.tsx'
  );

  test('replaces same-slice alias barrel import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import { usePhotoViewer } from '@features/diary/model/hooks';",
    });

    expect(reports).toEqual([
      {
        messageId: 'useRelative',
        data: {
          replacement:
            "import usePhotoViewer from '../model/hooks/usePhotoViewer';",
        },
        output: "import usePhotoViewer from '../model/hooks/usePhotoViewer';",
      },
    ]);
  });

  test('replaces relative barrel import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import { usePhotoViewer } from '../model/hooks';",
    });

    expect(reports[0]?.output).toBe(
      "import usePhotoViewer from '../model/hooks/usePhotoViewer';"
    );
  });

  test('resolves export-star type import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import type { Entry } from '../model/types';",
    });

    expect(reports[0]?.output).toBe(
      "import type { Entry } from '../model/types/Entry';"
    );
  });

  test('splits imports resolved to different files', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import { alpha, beta } from '../model/values';",
    });

    expect(reports[0]?.output).toBe(
      [
        "import alpha from '../model/values/alpha';",
        "import { beta } from '../model/values/beta';",
      ].join('\n')
    );
  });

  test('does not report direct relative import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import usePhotoViewer from '../model/hooks/usePhotoViewer';",
    });

    expect(reports).toEqual([]);
  });

  test('converts direct same-slice alias to relative import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import usePhotoViewer from '@features/diary/model/hooks/usePhotoViewer';",
    });

    expect(reports[0]?.output).toBe(
      "import usePhotoViewer from '../model/hooks/usePhotoViewer';"
    );
  });

  test('ignores namespace import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import * as styles from '../styles/Switcher';",
    });

    expect(reports).toEqual([]);
  });

  test('ignores side-effect import', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import '../model/setup';",
    });

    expect(reports).toEqual([]);
  });

  test('ignores JSON import', () => {
    const filename = path.join(sourceRoot, 'features/diary/i18n/index.ts');

    const reports = runRule({
      filename,
      code: "import en from './en.json';",
    });

    expect(reports).toEqual([]);
  });

  test('ignores import from another slice', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import { theme } from '@features/theme';",
    });

    expect(reports).toEqual([]);
  });

  test('stops on cyclic re-exports', () => {
    const reports = runRule({
      filename: componentFilename,
      code: "import { missing } from '../model/cycle/a';",
    });

    expect(reports).toEqual([
      {
        messageId: 'cannotResolve',
        data: {
          importName: 'missing',
        },
        output: null,
      },
    ]);
  });

  test('does not reformat an already direct multiline relative import', () => {
    writeFile(
      path.join(sourceRoot, 'features/auth/model/types/auth.ts'),
      `
      export type LoginUserFormValues = {};
      export type RegisterUserPayload = {};
      export type UserData = {};
    `
    );

    const reports = runRule({
      filename: path.join(sourceRoot, 'features/auth/api/authApi.ts'),
      code: `import type {
  LoginUserFormValues,
  RegisterUserPayload,
  UserData,
} from '../model/types/auth';`,
    });

    expect(reports).toEqual([]);
  });
});
