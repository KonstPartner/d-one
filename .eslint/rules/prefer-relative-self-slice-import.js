const path = require('path');

const LAYERS = new Set([
  'app',
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
]);

const ALIAS_PATTERN =
  /^@(app|pages|widgets|features|entities|shared)\/([^/]+)(\/.*)?$/;

const normalizePath = (value) => value.split(path.sep).join('/');

const getCurrentSlice = ({ filename, cwd, srcDir }) => {
  const absoluteFilename = path.resolve(filename);
  const sourceRoot = path.resolve(cwd, srcDir);

  const relativeFilename = normalizePath(
    path.relative(sourceRoot, absoluteFilename)
  );

  if (relativeFilename.startsWith('../') || relativeFilename === '..') {
    return null;
  }

  const [layer, slice] = relativeFilename.split('/');

  if (!LAYERS.has(layer) || !slice) {
    return null;
  }

  return {
    layer,
    slice,
    sourceRoot,
    absoluteFilename,
  };
};

const createRelativeImport = ({ filename, sourceRoot, importPath }) => {
  const targetPath = path.resolve(sourceRoot, importPath.slice(1));

  let relativePath = normalizePath(
    path.relative(path.dirname(filename), targetPath)
  );

  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
};

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',

    docs: {
      description:
        'Replace aliases with relative imports inside the same slice',
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
      useRelative:
        'Use relative import "{{relativePath}}" inside the same slice.',
      cannotFixRoot:
        'Root import of the current slice cannot be converted automatically.',
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

    const checkImportSource = (sourceNode) => {
      const importPath = sourceNode.value;

      if (typeof importPath !== 'string') {
        return;
      }

      const match = importPath.match(ALIAS_PATTERN);

      if (!match) {
        return;
      }

      const [, importedLayer, importedSlice, subPath] = match;

      const isSameSlice =
        importedLayer === currentSlice.layer &&
        importedSlice === currentSlice.slice;

      if (!isSameSlice) {
        return;
      }

      if (!subPath) {
        context.report({
          node: sourceNode,
          messageId: 'cannotFixRoot',
        });

        return;
      }

      const relativePath = createRelativeImport({
        filename: currentSlice.absoluteFilename,
        sourceRoot: currentSlice.sourceRoot,
        importPath,
      });

      context.report({
        node: sourceNode,
        messageId: 'useRelative',
        data: {
          relativePath,
        },

        fix(fixer) {
          const sourceText = context.getSourceCode().getText(sourceNode);

          const quote = sourceText.startsWith('"') ? '"' : "'";

          return fixer.replaceText(
            sourceNode,
            `${quote}${relativePath}${quote}`
          );
        },
      });
    };

    return {
      ImportDeclaration(node) {
        checkImportSource(node.source);
      },

      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImportSource(node.source);
        }
      },

      ExportAllDeclaration(node) {
        checkImportSource(node.source);
      },
    };
  },
};
