import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'src');
const resourcesDir = path.join(sourceDir, 'shared', 'i18n', 'resources');
const languages = ['en', 'ru'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);

const keysByLanguage = new Map();

for (const language of languages) {
  const translationFiles = findFiles(
    resourcesDir,
    (fileName) => path.basename(fileName) === `${language}.json`
  );

  if (translationFiles.length === 0) {
    console.error(`No ${language}.json translation files found.`);
    process.exit(1);
  }

  const keys = new Set();

  for (const fileName of translationFiles) {
    let translations;

    try {
      translations = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (error) {
      const relativePath = path.relative(rootDir, fileName);
      const message = error instanceof Error ? error.message : String(error);

      console.error(`${relativePath} - error i18n-json: ${message}`);
      process.exit(1);
    }

    collectTranslationKeys(translations, '', keys);
  }

  keysByLanguage.set(language, keys);
}

const sourceFiles = findFiles(sourceDir, (fileName) =>
  sourceExtensions.has(path.extname(fileName))
);
const diagnostics = [];

for (const fileName of sourceFiles) {
  const sourceText = fs.readFileSync(fileName, 'utf8');
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(fileName)
  );

  const visit = (node) => {
    if (ts.isCallExpression(node) && isTranslationCall(node.expression)) {
      const argument = node.arguments[0];

      if (argument && ts.isStringLiteralLike(argument)) {
        const key = argument.text;
        const hasCount = hasCountOption(node.arguments[1]);
        const missingLanguages = languages.filter(
          (language) => !hasTranslationKey(language, key, hasCount)
        );

        if (missingLanguages.length > 0) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(
            argument.getStart(sourceFile)
          );

          diagnostics.push({
            fileName,
            line: line + 1,
            character: character + 1,
            key,
            missingLanguages,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

if (diagnostics.length === 0) {
  console.log('No missing i18n keys found.');
  process.exit(0);
}

diagnostics.sort(
  (left, right) =>
    left.fileName.localeCompare(right.fileName) ||
    left.line - right.line ||
    left.character - right.character
);

for (const diagnostic of diagnostics) {
  const relativePath = path.relative(rootDir, diagnostic.fileName);

  console.error(
    `${relativePath}:${diagnostic.line}:${diagnostic.character} - error i18n-key-missing: ` +
      `"${diagnostic.key}" is missing in ${diagnostic.missingLanguages.join(', ')}`
  );
}

process.exit(1);

function findFiles(directory, predicate) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fileName = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...findFiles(fileName, predicate));
    } else if (entry.isFile() && predicate(fileName)) {
      files.push(fileName);
    }
  }

  return files;
}

function collectTranslationKeys(value, prefix, keys) {
  if (prefix) {
    keys.add(prefix);
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nestedPrefix = prefix ? `${prefix}.${key}` : key;

    collectTranslationKeys(nestedValue, nestedPrefix, keys);
  }
}

function hasTranslationKey(language, key, allowPlural) {
  const keys = keysByLanguage.get(language);

  if (keys.has(key)) {
    return true;
  }

  if (!allowPlural) {
    return false;
  }

  const pluralCategories = new Intl.PluralRules(language).resolvedOptions()
    .pluralCategories;

  return pluralCategories.every((category) =>
    keys.has(`${key}_${category}`)
  );
}

function hasCountOption(argument) {
  if (!argument || !ts.isObjectLiteralExpression(argument)) {
    return false;
  }

  return argument.properties.some((property) => {
    if (ts.isShorthandPropertyAssignment(property)) {
      return property.name.text === 'count';
    }

    if (!ts.isPropertyAssignment(property)) {
      return false;
    }

    const { name } = property;

    return (
      (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) &&
      name.text === 'count'
    );
  });
}

function isTranslationCall(expression) {
  if (ts.isIdentifier(expression)) {
    return expression.text === 't';
  }

  if (!ts.isPropertyAccessExpression(expression) || expression.name.text !== 't') {
    return false;
  }

  return (
    ts.isIdentifier(expression.expression) &&
    (expression.expression.text === 'i18n' || expression.expression.text === 'i18next')
  );
}

function getScriptKind(fileName) {
  switch (path.extname(fileName)) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.js':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}
