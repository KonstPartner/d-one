import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const ts = require('typescript/lib/tsserverlibrary');
const initStyledPlugin = require('@styled/typescript-styled-plugin');

const rootDir = process.cwd();
const configPath = path.join(rootDir, 'tsconfig.json');

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

if (configFile.error) {
  printDiagnostics([configFile.error]);
  process.exit(1);
}

const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  rootDir,
  undefined,
  configPath
);

if (parsedConfig.errors.length > 0) {
  printDiagnostics(parsedConfig.errors);
  process.exit(1);
}

const host = {
  getCompilationSettings: () => parsedConfig.options,
  getScriptFileNames: () => parsedConfig.fileNames,
  getScriptVersion: () => '0',

  getScriptSnapshot(fileName) {
    const text = ts.sys.readFile(fileName);

    return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
  },

  getCurrentDirectory: () => rootDir,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),

  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
  realpath: ts.sys.realpath,

  useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
  getNewLine: () => ts.sys.newLine,
};

const languageService = ts.createLanguageService(
  host,
  ts.createDocumentRegistry()
);

const project = {
  projectService: {
    logger: {
      info() {},
    },
  },

  getLanguageService: () => languageService,

  getScriptInfo(fileName) {
    const sourceFile = languageService.getProgram()?.getSourceFile(fileName);

    if (!sourceFile) {
      return undefined;
    }

    return {
      positionToLineOffset(position) {
        const { line, character } =
          sourceFile.getLineAndCharacterOfPosition(position);

        return {
          line: line + 1,
          offset: character + 1,
        };
      },

      lineOffsetToPosition(line, offset) {
        return sourceFile.getPositionOfLineAndCharacter(line - 1, offset - 1);
      },
    };
  },
};

const pluginConfig =
  configFile.config.compilerOptions?.plugins?.find(
    (plugin) => plugin.name === '@styled/typescript-styled-plugin'
  ) ?? {};

const diagnosticLanguageService = new Proxy(languageService, {
  get(target, property) {
    if (property === 'getSemanticDiagnostics') {
      return () => [];
    }

    const value = Reflect.get(target, property);

    return typeof value === 'function' ? value.bind(target) : value;
  },
});

const plugin = initStyledPlugin({
  typescript: ts,
});

const styledLanguageService = plugin.create({
  project,
  languageService: diagnosticLanguageService,
  languageServiceHost: host,
  serverHost: ts.sys,
  config: pluginConfig,
});

const sourceRoot = `${path.resolve(rootDir, 'src')}${path.sep}`;

const files = parsedConfig.fileNames.filter((fileName) => {
  const absolutePath = path.resolve(fileName);

  return (
    absolutePath.startsWith(sourceRoot) &&
    (absolutePath.endsWith('.ts') || absolutePath.endsWith('.tsx'))
  );
});

const diagnostics = [];

for (const fileName of files) {
  const fileDiagnostics =
    styledLanguageService.getSemanticDiagnostics(fileName);

  for (const diagnostic of fileDiagnostics) {
    if (
      diagnostic.source === 'ts-styled-plugin' &&
      diagnostic.category === ts.DiagnosticCategory.Error
    ) {
      diagnostics.push(diagnostic);
    }
  }
}

if (diagnostics.length === 0) {
  console.log('No styled CSS errors found.');
  process.exit(0);
}

printDiagnostics(diagnostics);
process.exit(1);

function printDiagnostics(items) {
  for (const diagnostic of items) {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n'
    );

    if (!diagnostic.file || diagnostic.start === undefined) {
      console.error(`error TS${diagnostic.code}: ${message}`);

      continue;
    }

    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start
    );

    const relativePath = path.relative(rootDir, diagnostic.file.fileName);

    const source = diagnostic.source
      ? `${diagnostic.source}(${diagnostic.code})`
      : `TS${diagnostic.code}`;

    console.error(
      `${relativePath}:${line + 1}:${character + 1} - error ${source}: ${message}`
    );
  }
}
