/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { ImportOptions } from '@babel/helper-module-imports';
import type { NodePath } from '@babel/traverse';
import { addDefault, addNamed } from '@babel/helper-module-imports';

type ImportAdditionOptions = Omit<
  Partial<ImportOptions>,
  'ensureLiveReference' | 'ensureNoContext',
>;

import * as t from '@babel/types';

export function hoistExpression(
  path: NodePath<>,
  astExpression: t.Expression,
): t.Expression {
  const programStatementPath = getProgramStatement(path);
  if (programStatementPath == null) {
    return astExpression;
  }

  const nameIdent = path.scope.generateUidIdentifier();

  programStatementPath.insertBefore(
    t.variableDeclaration('const', [
      t.variableDeclarator(nameIdent, astExpression),
    ]),
  );
  return nameIdent;
}

export function pathReplaceHoisted(
  path: NodePath<>,
  astExpression: t.Expression,
): void {
  // If the object is already hoisted, leave it inlined.
  if (isProgramLevel(path)) {
    path.replaceWith(astExpression);
    return;
  }

  const programStatementPath = getProgramStatement(path);
  if (programStatementPath == null) {
    path.replaceWith(astExpression);
    return;
  }

  // Create a unique identifier in scope
  const nameIdent = path.scope.generateUidIdentifier('styles');

  programStatementPath.insertBefore(
    t.variableDeclaration('const', [
      t.variableDeclarator(nameIdent, astExpression),
    ]),
  );
  path.replaceWith(nameIdent);
}

function getProgramPath(path: NodePath<>): null | NodePath<t.Program> {
  let programPath = path;
  while (programPath != null && !programPath.isProgram()) {
    if (programPath.parentPath) {
      programPath = programPath.parentPath;
    } else {
      return null;
    }
  }
  return programPath;
}

export function addNamedImport(
  statementPath: NodePath<>,
  as: string,
  from: string,
  options: ImportAdditionOptions,
): t.Identifier {
  const identifier = addNamed(statementPath, as, from, options);
  const programPath = getProgramPath(statementPath);
  if (programPath == null) {
    return identifier;
  }
  const bodyPath: Array<NodePath<t.Statement>> = programPath.get('body');
  let targetImportIndex = -1;
  for (let i = 0; i < bodyPath.length; i++) {
    const statement = bodyPath[i];
    if (statement.isImportDeclaration()) {
      targetImportIndex = i;
      if (
        statement.node.specifiers.find(
          (s) =>
            s.type === 'ImportSpecifier' &&
            s.local.type === 'Identifier' &&
            s.local.name === identifier.name,
        )
      ) {
        break;
      }
    }
  }
  if (targetImportIndex === -1) {
    return identifier;
  }
  const lastImport = bodyPath[targetImportIndex];
  if (lastImport == null) {
    return identifier;
  }
  const importName = statementPath.scope.generateUidIdentifier(as);

  lastImport.insertAfter(
    t.variableDeclaration('var', [
      t.variableDeclarator(importName, identifier),
    ]),
  );

  return importName;
}

export function addDefaultImport(
  statementPath: NodePath<>,
  from: string,
  options: ImportAdditionOptions,
): t.Identifier {
  const identifier = addDefault(statementPath, from, options);
  const programPath = getProgramPath(statementPath);
  if (programPath == null) {
    return identifier;
  }
  const bodyPath: Array<NodePath<t.Statement>> = programPath.get('body');
  let targetImportIndex = -1;
  for (let i = 0; i < bodyPath.length; i++) {
    const statement = bodyPath[i];
    if (statement.isImportDeclaration()) {
      targetImportIndex = i;
      if (
        statement.node.specifiers.find(
          (s) =>
            s.type === 'ImportDefaultSpecifier' &&
            s.local.type === 'Identifier' &&
            s.local.name === identifier.name,
        )
      ) {
        break;
      }
    }
  }
  if (targetImportIndex === -1) {
    return identifier;
  }
  const lastImport = bodyPath[targetImportIndex];
  if (lastImport == null) {
    return identifier;
  }
  const importName = statementPath.scope.generateUidIdentifier('inject');

  lastImport.insertAfter(
    t.variableDeclaration('var', [
      t.variableDeclarator(importName, identifier),
    ]),
  );

  return importName;
}

export function isProgramLevel(path: NodePath<>): boolean {
  let programPath = path;
  if (programPath.isStatement() && programPath?.parentPath?.isProgram()) {
    return true;
  }
  while (programPath.parentPath != null) {
    const parentPath = programPath.parentPath;
    if (
      programPath.isStatement() &&
      !programPath.parentPath?.isProgram() &&
      !programPath.parentPath?.isExportDeclaration()
    ) {
      return false;
    }
    if (programPath.isFunction()) {
      return false;
    }
    programPath = parentPath;
  }
  return true;
}

export function getProgramStatement(path: NodePath<>): NodePath<> {
  let programPath = path;
  while (
    programPath.parentPath != null &&
    !programPath.parentPath.isProgram() &&
    programPath.parentPath != null
  ) {
    programPath = programPath.parentPath;
  }
  return programPath;
}
