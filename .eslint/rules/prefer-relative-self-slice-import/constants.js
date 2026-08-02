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

const FILE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mts',
  '.cts',
  '.mjs',
  '.cjs',
];

module.exports = {
  LAYERS,
  ALIAS_PATTERN,
  FILE_EXTENSIONS,
};
