const path = require('path');

const { LAYERS } = require('./constants');

const normalizePath = (value) => value.split(path.sep).join('/');

const isPathInside = (parentPath, childPath) => {
  const relativePath = path.relative(parentPath, childPath);

  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
};

const removeFileExtension = (filename) =>
  filename.replace(/(?:\.d)?\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/, '');

const createRelativeImport = ({ filename, targetFile }) => {
  let relativePath = normalizePath(
    path.relative(path.dirname(filename), removeFileExtension(targetFile))
  );

  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
};

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
    sliceRoot: path.resolve(sourceRoot, layer, slice),
    absoluteFilename,
  };
};

module.exports = {
  normalizePath,
  isPathInside,
  createRelativeImport,
  getCurrentSlice,
};
