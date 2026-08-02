const fs = require('fs');
const path = require('path');

const { ALIAS_PATTERN, FILE_EXTENSIONS } = require('./constants');

const fileExists = (filename) => {
  try {
    return fs.statSync(filename).isFile();
  } catch {
    return false;
  }
};

const directoryExists = (filename) => {
  try {
    return fs.statSync(filename).isDirectory();
  } catch {
    return false;
  }
};

const isScriptFile = (filename) =>
  FILE_EXTENSIONS.some((extension) => filename.endsWith(extension));

const resolveModuleFile = (modulePath) => {
  if (fileExists(modulePath)) {
    return modulePath;
  }

  for (const extension of FILE_EXTENSIONS) {
    const filename = `${modulePath}${extension}`;

    if (fileExists(filename)) {
      return filename;
    }
  }

  if (!directoryExists(modulePath)) {
    return null;
  }

  for (const extension of FILE_EXTENSIONS) {
    const filename = path.join(modulePath, `index${extension}`);

    if (fileExists(filename)) {
      return filename;
    }
  }

  return null;
};

const resolveReferencedModule = ({ sourceFile, moduleName, sourceRoot }) => {
  if (moduleName.startsWith('.')) {
    return resolveModuleFile(
      path.resolve(path.dirname(sourceFile), moduleName)
    );
  }

  if (ALIAS_PATTERN.test(moduleName)) {
    return resolveModuleFile(path.resolve(sourceRoot, moduleName.slice(1)));
  }

  return null;
};

module.exports = {
  isScriptFile,
  resolveModuleFile,
  resolveReferencedModule,
};
