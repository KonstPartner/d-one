const { ALIAS_PATTERN } = require('./constants');

const {
  getCurrentSlice,
  isPathInside,
  createRelativeImport,
} = require('./path-utils');

const { isScriptFile, resolveReferencedModule } = require('./module-resolver');

const { resolveExport } = require('./export-resolver');

const { renderResolvedImports } = require('./import-renderer');

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',

    docs: {
      description:
        'Replace same-slice barrel imports with direct relative imports',
    },

    schema: [
      {
        type: 'object',
        properties: {
          srcDir: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      useRelative: 'Use direct relative import "{{replacement}}".',
      cannotResolve: 'Cannot resolve "{{importName}}" to its source file.',
    },
  },

  create(context) {
    const rawFilename =
      typeof context.getPhysicalFilename === 'function'
        ? context.getPhysicalFilename()
        : context.getFilename();

    if (!rawFilename || rawFilename === '<input>' || rawFilename === '<text>') {
      return {};
    }

    const cwd =
      typeof context.getCwd === 'function' ? context.getCwd() : process.cwd();

    const srcDir = context.options[0]?.srcDir ?? 'src';

    const currentSlice = getCurrentSlice({
      filename: rawFilename,
      cwd,
      srcDir,
    });

    if (!currentSlice) {
      return {};
    }

    const sourceCode = context.getSourceCode();

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        if (typeof importPath !== 'string') {
          return;
        }

        let targetFile = null;

        const aliasMatch = importPath.match(ALIAS_PATTERN);

        if (aliasMatch) {
          const [, importedLayer, importedSlice] = aliasMatch;

          const isSameSlice =
            importedLayer === currentSlice.layer &&
            importedSlice === currentSlice.slice;

          if (!isSameSlice) {
            return;
          }

          targetFile = resolveReferencedModule({
            sourceFile: currentSlice.absoluteFilename,
            moduleName: importPath,
            sourceRoot: currentSlice.sourceRoot,
          });
        } else if (importPath.startsWith('.')) {
          targetFile = resolveReferencedModule({
            sourceFile: currentSlice.absoluteFilename,
            moduleName: importPath,
            sourceRoot: currentSlice.sourceRoot,
          });

          if (
            !targetFile ||
            !isPathInside(currentSlice.sliceRoot, targetFile)
          ) {
            return;
          }
        } else {
          return;
        }

        if (!targetFile) {
          return;
        }

        if (!isScriptFile(targetFile)) {
          return;
        }

        if (node.specifiers.length === 0) {
          return;
        }

        const namespaceSpecifier = node.specifiers.find(
          (specifier) => specifier.type === 'ImportNamespaceSpecifier'
        );

        if (namespaceSpecifier) {
          if (!aliasMatch) {
            return;
          }

          const relativePath = createRelativeImport({
            filename: currentSlice.absoluteFilename,
            targetFile,
          });

          if (relativePath === importPath) {
            return;
          }

          const sourceText = sourceCode.getText(node.source);
          const quote = sourceText.startsWith('"') ? '"' : "'";

          context.report({
            node: node.source,
            messageId: 'useRelative',
            data: {
              replacement: relativePath,
            },

            fix(fixer) {
              return fixer.replaceText(
                node.source,
                `${quote}${relativePath}${quote}`
              );
            },
          });

          return;
        }

        const resolvedImports = [];

        for (const specifier of node.specifiers) {
          let importName;
          let localName;
          let typeOnly = false;

          if (specifier.type === 'ImportDefaultSpecifier') {
            importName = 'default';
            localName = specifier.local.name;

            typeOnly = node.importKind === 'type';
          } else if (specifier.type === 'ImportSpecifier') {
            importName = specifier.imported.name ?? specifier.imported.value;

            localName = specifier.local.name;

            typeOnly =
              node.importKind === 'type' || specifier.importKind === 'type';
          } else {
            return;
          }

          const resolved = resolveExport({
            sourceFile: targetFile,
            exportName: importName,
            sourceRoot: currentSlice.sourceRoot,
          });

          if (!resolved) {
            context.report({
              node,
              messageId: 'cannotResolve',
              data: {
                importName,
              },
            });

            return;
          }

          resolvedImports.push({
            ...resolved,
            localName,
            typeOnly,
            relativePath: createRelativeImport({
              filename: currentSlice.absoluteFilename,
              targetFile: resolved.sourceFile,
            }),
          });
        }

        const importsDirectlyFromTarget = resolvedImports.every(
          (resolvedImport) => resolvedImport.sourceFile === targetFile
        );

        if (importsDirectlyFromTarget) {
          if (!aliasMatch) {
            return;
          }

          const relativePath = createRelativeImport({
            filename: currentSlice.absoluteFilename,
            targetFile,
          });

          const sourceText = sourceCode.getText(node.source);
          const quote = sourceText.startsWith('"') ? '"' : "'";

          context.report({
            node: node.source,
            messageId: 'useRelative',
            data: {
              replacement: relativePath,
            },

            fix(fixer) {
              return fixer.replaceText(
                node.source,
                `${quote}${relativePath}${quote}`
              );
            },
          });

          return;
        }

        const originalText = sourceCode.getText(node);

        const sourceText = sourceCode.getText(node.source);

        const quote = sourceText.startsWith('"') ? '"' : "'";

        const semicolon = originalText.trimEnd().endsWith(';');

        const replacement = renderResolvedImports({
          resolvedImports,
          quote,
          semicolon,
        });

        if (replacement === originalText) {
          return;
        }

        context.report({
          node,
          messageId: 'useRelative',
          data: {
            replacement,
          },

          fix(fixer) {
            return fixer.replaceText(node, replacement);
          },
        });
      },
    };
  },
};
