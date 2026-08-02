const fs = require('fs');
const ts = require('typescript');

const { resolveReferencedModule } = require('./module-resolver');

const sourceFileCache = new Map();

const getScriptKind = (filename) => {
  if (filename.endsWith('.tsx')) {
    return ts.ScriptKind.TSX;
  }

  if (filename.endsWith('.jsx')) {
    return ts.ScriptKind.JSX;
  }

  if (
    filename.endsWith('.js') ||
    filename.endsWith('.mjs') ||
    filename.endsWith('.cjs')
  ) {
    return ts.ScriptKind.JS;
  }

  return ts.ScriptKind.TS;
};

const parseSourceFile = (filename) => {
  const fileStats = fs.statSync(filename);

  const cached = sourceFileCache.get(filename);

  if (
    cached &&
    cached.mtimeMs === fileStats.mtimeMs &&
    cached.size === fileStats.size
  ) {
    return cached.source;
  }

  const source = ts.createSourceFile(
    filename,
    fs.readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filename)
  );

  sourceFileCache.set(filename, {
    mtimeMs: fileStats.mtimeMs,
    size: fileStats.size,
    source,
  });

  return source;
};

const hasModifier = (node, modifierKind) =>
  node.modifiers?.some((modifier) => modifier.kind === modifierKind) ?? false;

const declarationContainsName = (statement, exportName) => {
  if (
    ts.isFunctionDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    ts.isModuleDeclaration(statement)
  ) {
    return statement.name?.text === exportName;
  }

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.some(
      (declaration) =>
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === exportName
    );
  }

  return false;
};

const resolveImportedLocal = ({
  source,
  localName,
  sourceFile,
  sourceRoot,
  visited,
}) => {
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.importClause
    ) {
      continue;
    }

    const targetFile = resolveReferencedModule({
      sourceFile,
      moduleName: statement.moduleSpecifier.text,
      sourceRoot,
    });

    if (!targetFile) {
      continue;
    }

    if (statement.importClause.name?.text === localName) {
      return (
        resolveExport({
          sourceFile: targetFile,
          exportName: 'default',
          sourceRoot,
          visited,
        }) ?? {
          sourceFile: targetFile,
          importKind: 'default',
          importedName: 'default',
        }
      );
    }

    const namedBindings = statement.importClause.namedBindings;

    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    for (const element of namedBindings.elements) {
      if (element.name.text !== localName) {
        continue;
      }

      const importedName = element.propertyName?.text ?? element.name.text;

      return (
        resolveExport({
          sourceFile: targetFile,
          exportName: importedName,
          sourceRoot,
          visited,
        }) ?? {
          sourceFile: targetFile,
          importKind: importedName === 'default' ? 'default' : 'named',
          importedName,
        }
      );
    }
  }

  return null;
};

const resolveExport = ({
  sourceFile,
  exportName,
  sourceRoot,
  visited = new Set(),
}) => {
  const visitKey = `${sourceFile}:${exportName}`;

  if (visited.has(visitKey)) {
    return null;
  }

  const nextVisited = new Set(visited);

  nextVisited.add(visitKey);

  const source = parseSourceFile(sourceFile);

  for (const statement of source.statements) {
    if (
      exportName === 'default' &&
      (ts.isExportAssignment(statement) ||
        (hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
          hasModifier(statement, ts.SyntaxKind.DefaultKeyword)))
    ) {
      return {
        sourceFile,
        importKind: 'default',
        importedName: 'default',
      };
    }

    if (
      hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
      declarationContainsName(statement, exportName)
    ) {
      return {
        sourceFile,
        importKind: 'named',
        importedName: exportName,
      };
    }
  }

  for (const statement of source.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      continue;
    }

    for (const element of statement.exportClause.elements) {
      const exportedName = element.name.text;

      if (exportedName !== exportName) {
        continue;
      }

      const importedName = element.propertyName?.text ?? element.name.text;

      if (
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        const targetFile = resolveReferencedModule({
          sourceFile,
          moduleName: statement.moduleSpecifier.text,
          sourceRoot,
        });

        if (!targetFile) {
          return null;
        }

        if (importedName === 'default') {
          return {
            sourceFile: targetFile,
            importKind: 'default',
            importedName: 'default',
          };
        }

        return (
          resolveExport({
            sourceFile: targetFile,
            exportName: importedName,
            sourceRoot,
            visited: nextVisited,
          }) ?? {
            sourceFile: targetFile,
            importKind: 'named',
            importedName,
          }
        );
      }

      const importedLocal = resolveImportedLocal({
        source,
        localName: importedName,
        sourceFile,
        sourceRoot,
        visited: nextVisited,
      });

      if (importedLocal) {
        return importedLocal;
      }

      const hasLocalDeclaration = source.statements.some((candidate) =>
        declarationContainsName(candidate, importedName)
      );

      if (hasLocalDeclaration) {
        return {
          sourceFile,
          importKind: exportName === 'default' ? 'default' : 'named',
          importedName: exportName === 'default' ? 'default' : exportName,
        };
      }

      return null;
    }
  }

  if (exportName === 'default') {
    return null;
  }

  for (const statement of source.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.exportClause ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }

    const targetFile = resolveReferencedModule({
      sourceFile,
      moduleName: statement.moduleSpecifier.text,
      sourceRoot,
    });

    if (!targetFile) {
      continue;
    }

    const resolved = resolveExport({
      sourceFile: targetFile,
      exportName,
      sourceRoot,
      visited: nextVisited,
    });

    if (resolved) {
      return resolved;
    }
  }

  return null;
};

module.exports = {
  resolveExport,
};
