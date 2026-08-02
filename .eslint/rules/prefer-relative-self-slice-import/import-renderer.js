const renderNamedImport = ({ importedName, localName }) => {
  if (importedName === localName) {
    return importedName;
  }

  return `${importedName} as ${localName}`;
};

const renderResolvedImports = ({ resolvedImports, quote, semicolon }) => {
  const statements = [];

  const suffix = semicolon ? ';' : '';

  const groups = new Map();

  for (const resolvedImport of resolvedImports) {
    const key = resolvedImport.relativePath;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(resolvedImport);
  }

  for (const [relativePath, imports] of groups) {
    const defaultImports = imports.filter(
      (item) => item.importKind === 'default' && !item.typeOnly
    );

    const namedImports = imports.filter(
      (item) => item.importKind === 'named' && !item.typeOnly
    );

    const typeDefaultImports = imports.filter(
      (item) => item.importKind === 'default' && item.typeOnly
    );

    const typeNamedImports = imports.filter(
      (item) => item.importKind === 'named' && item.typeOnly
    );

    if (defaultImports.length > 0) {
      const [firstDefaultImport, ...remainingDefaultImports] = defaultImports;

      const bindings = [firstDefaultImport.localName];

      if (namedImports.length > 0) {
        bindings.push(`{ ${namedImports.map(renderNamedImport).join(', ')} }`);
      }

      statements.push(
        `import ${bindings.join(', ')} from ${quote}${relativePath}${quote}${suffix}`
      );

      for (const defaultImport of remainingDefaultImports) {
        statements.push(
          `import ${defaultImport.localName} from ${quote}${relativePath}${quote}${suffix}`
        );
      }
    } else if (namedImports.length > 0) {
      statements.push(
        `import { ${namedImports
          .map(renderNamedImport)
          .join(', ')} } from ${quote}${relativePath}${quote}${suffix}`
      );
    }

    for (const typeDefaultImport of typeDefaultImports) {
      statements.push(
        `import type ${typeDefaultImport.localName} from ${quote}${relativePath}${quote}${suffix}`
      );
    }

    if (typeNamedImports.length > 0) {
      statements.push(
        `import type { ${typeNamedImports
          .map(renderNamedImport)
          .join(', ')} } from ${quote}${relativePath}${quote}${suffix}`
      );
    }
  }

  return statements.join('\n');
};

module.exports = {
  renderResolvedImports,
};
