/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import readFile from 'fs-readfile-promise';
import * as _ from 'lodash';
import ts from 'typescript';

import {DEFAULT_ARRAY_RANGE, FIXED_ARRAY_COUNT} from '../../lib/constants';
import {defaultTypeToMock} from '../../lib/default-type-to-mock';
import {fake} from '../../lib/fake';
import {randomRange} from '../../lib/random-range';
import {smartProps} from '../../lib/smart-props';
import {stringify} from '../../lib/stringify';
import {FileTuple, FileTuples, MapLike} from '../../lib/types';

export interface Options {
  files: string[];
  interfaces?: string[];
  isFixedMode?: boolean;
  isOptionalAlwaysEnabled?: boolean;
}

type TypeCacheRecord = {
  kind: ts.SyntaxKind,
  aliasedTo: ts.SyntaxKind
};

type Output = MapLike<{}>;

export class Intermock {
  types: MapLike<{}> = {};

  constructor(private readonly options: Options) {}

  private readFiles(): Promise<FileTuples> {
    const filePromises = this.options.files.map(file => readFile(file));
    return new Promise((resolve) => {
      Promise.all(filePromises).then(buffers => {
        const contents: string[][] = [];
        buffers.forEach(
            (buffer, index) =>
                contents.push([this.options.files[index], buffer.toString()]));
        resolve(contents as FileTuples);
      });
    });
  }

  mock(property: string, syntaxType: ts.SyntaxKind, mockType?: string) {
    const smartMockType = smartProps[property];
    const isFixedMode =
        this.options.isFixedMode ? this.options.isFixedMode : false;

    if (mockType) {
      return fake(mockType, this.options.isFixedMode);
    } else if (smartMockType) {
      return fake(smartMockType, this.options.isFixedMode);
    } else {
      return defaultTypeToMock[syntaxType](isFixedMode);
    }
  }

  isQuestionToken(questionToken: ts.Token<ts.SyntaxKind.QuestionToken>|
                  undefined) {
    if (questionToken) {
      if (this.options.isFixedMode && !this.options.isOptionalAlwaysEnabled) {
        return true;
      }

      else if (Math.random() < .5 && !this.options.isOptionalAlwaysEnabled) {
        return true;
      }
    }

    return false;
  }

  processGenericPropertyType(
      output: Output, property: string, kind: ts.SyntaxKind, mockType: string) {
    const mock = this.mock(property, kind, mockType);
    output[property] = mock;
  }

  processFunctionPropertyType(
      node: ts.PropertySignature, output: Output, property: string,
      typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile) {
    // TODO process args from parameters of function
    const args = '';
    let body = '';

    const funcNode = node.type as ts.FunctionTypeNode;
    const returnType = funcNode.type;

    switch (returnType.kind) {
      case ts.SyntaxKind.TypeReference:
        const tempBody: MapLike<{}> = {};
        this.processPropertyTypeReference(
            node, tempBody, 'body', _.get(returnType, 'typeName.text'),
            returnType.kind, sourceFile);

        body = `return ${stringify(tempBody['body'])}`;
        break;
      default:
        body = `return ${JSON.stringify(this.mock('', returnType.kind))}`;
        break;
    }

    const func = new Function(args, body);
    output[property] = func;
  }

  processPropertyTypeReference(
      node: ts.PropertySignature, output: Output, property: string,
      typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile) {
    let normalizedTypeName;

    if (typeName.startsWith('Array<')) {
      normalizedTypeName = typeName.replace('Array<', '').replace('>', '');
    } else {
      normalizedTypeName = typeName;
    }

    if (normalizedTypeName !== typeName) {
      this.processArrayPropertyType(
          node, output, property, normalizedTypeName, kind, sourceFile);
      return;
    }

    switch ((this.types[normalizedTypeName] as TypeCacheRecord).kind) {
      case ts.SyntaxKind.EnumDeclaration:
        this.setEnum(sourceFile, node, output, typeName, property);
        break;
      default:
        if ((this.types[normalizedTypeName] as TypeCacheRecord).kind !==
            (this.types[normalizedTypeName] as TypeCacheRecord).aliasedTo) {
          const alias =
              (this.types[normalizedTypeName] as TypeCacheRecord).aliasedTo;
          const isPrimitiveType = alias === ts.SyntaxKind.StringKeyword ||
              alias === ts.SyntaxKind.NumberKeyword ||
              alias === ts.SyntaxKind.BooleanKeyword;

          if (isPrimitiveType) {
            output[property] = this.mock(property, alias, '');
          } else {
            // TODO
          }
        } else {
          output[property] = {};
          this.processFile(sourceFile, output[property], typeName);
          break;
        }
    }
  }

  processJsDocs(
      node: ts.PropertySignature, output: Output, property: string,
      jsDocs: string[]) {
    // TODO handle case where we get multiple mock JSDocs or a JSDoc like
    // mockRange for an array. In essence, we are only dealing with
    // primitives now

    // TODO Handle error case where a complex type has MockDocs

    let mockType = '';
    const jsDocComment = _.get(jsDocs[0], 'comment', '');
    if (jsDocComment.startsWith('!mockType')) {
      mockType = jsDocComment.match(/(?<=\{).+?(?=\})/g)[0];
    } else {
      // TODO
    }

    const mock = this.mock(property, node.kind, mockType);
    output[property] = mock;
  }

  processArrayPropertyType(
      node: ts.PropertySignature, output: Output, property: string,
      typeName: string, kind: ts.SyntaxKind, sourceFile: ts.SourceFile) {
    typeName = typeName.replace('[', '').replace(']', '');
    output[property] = [];

    kind = _.get(node, 'type.elementType.kind');

    const isPrimitiveType = kind === ts.SyntaxKind.StringKeyword ||
        kind === ts.SyntaxKind.BooleanKeyword ||
        kind === ts.SyntaxKind.NumberKeyword;

    const arrayRange = this.options.isFixedMode ?
        FIXED_ARRAY_COUNT :
        randomRange(DEFAULT_ARRAY_RANGE[0], DEFAULT_ARRAY_RANGE[1]);

    for (let i = 0; i < arrayRange; i++) {
      if (isPrimitiveType) {
        (output[property] as Array<{}>)[i] = this.mock(property, kind, '');
      } else {
        (output[property] as Array<{}>).push({});
        this.processFile(
            sourceFile, (output[property] as Array<{}>)[i], typeName);
      }
    }
  }

  traverseInterfaceMembers(
      node: ts.Node, output: Output, sourceFile: ts.SourceFile) {
    if (node.kind !== ts.SyntaxKind.PropertySignature) {
      return;
    }

    const processPropertySignature = (node: ts.PropertySignature) => {
      const jsDocs = _.get(node, 'jsDoc', []);
      const property = node.name.getText();
      const questionToken = node.questionToken;

      let typeName = '';
      let kind;

      if (this.isQuestionToken(questionToken)) {
        return;
      }

      if (jsDocs.length > 0) {
        this.processJsDocs(node, output, property, jsDocs);
        return;
      }

      if (node.type) {
        kind = node.type.kind;
        typeName = node.type.getText();
      }

      switch (kind) {
        case ts.SyntaxKind.TypeReference:
          this.processPropertyTypeReference(
              node, output, property, typeName, kind as ts.SyntaxKind,
              sourceFile);
          break;
        case ts.SyntaxKind.ArrayType:
          this.processArrayPropertyType(
              node, output, property, typeName, kind as ts.SyntaxKind,
              sourceFile);
          break;
        case ts.SyntaxKind.FunctionType:
          this.processFunctionPropertyType(
              node, output, property, typeName, kind as ts.SyntaxKind,
              sourceFile);
          break;
        default:
          this.processGenericPropertyType(
              output, property, kind as ts.SyntaxKind, '');
          break;
      }
    };

    processPropertySignature(node as ts.PropertySignature);
  }

  setEnum(
      sourceFile: ts.SourceFile, node: ts.Node, output: Output,
      typeName: string, property: string) {
    const processNode = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.EnumDeclaration:
          if ((node as ts.EnumDeclaration).name.text === typeName) {
            const members = (node as ts.EnumDeclaration).members;
            const selectedMemberIdx = Math.floor(members.length / 2);
            const selectedMember = members[selectedMemberIdx];

            // TODO handle bitwise initializers
            if (selectedMember.initializer) {
              switch (selectedMember.initializer.kind) {
                case ts.SyntaxKind.NumericLiteral:
                  output[property] =
                      Number(selectedMember.initializer.getText());
                  break;
                case ts.SyntaxKind.StringLiteral:
                  output[property] =
                      selectedMember.initializer.getText().replace(/\'/g, '');
                  break;
                default:
                  break;
              }
            } else {
              output[property] = selectedMemberIdx;
            }
          }
          break;
        default:
          break;
      }

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }

  traverseInterface(
      node: ts.Node, output: Output, sourceFile: ts.SourceFile,
      propToTraverse?: string, path?: string) {
    if (path) {
      output[path] = {};
      output = output[path];
    }

    if (!propToTraverse && !path) {
      const newPath = (node as ts.InterfaceDeclaration).name.text;
      output[newPath] = {};
      output = output[newPath];
    }

    // TODO get range from JSDoc
    // TODO given a range of interfaces to generate, add to array. If 1
    // then just return an object
    node.forEachChild(
        child => this.traverseInterfaceMembers(child, output, sourceFile));
  }

  isSpecificInterface(name: string) {
    if (!this.options.interfaces) {
      return true;
    }

    if (!_.includes(this.options.interfaces, name)) {
      return false;
    }

    return true;
  }

  processFile(
      sourceFile: ts.SourceFile, output: Output, propToTraverse?: string) {
    const processNode = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          /**
           * TODO: Handle interfaces that extend others, via checking hertiage
           * clauses
           */
          const p = (node as ts.InterfaceDeclaration).name.text;
          if (!this.isSpecificInterface(p) && !propToTraverse) {
            return;
          }
          if (propToTraverse) {
            if (p === propToTraverse) {
              this.traverseInterface(node, output, sourceFile, propToTraverse);
            }
          } else {
            this.traverseInterface(node, output, sourceFile);
          }
          break;
        case ts.SyntaxKind.TypeAliasDeclaration:
          const type = (node as ts.TypeAliasDeclaration).type;
          const path = (node as ts.TypeAliasDeclaration).name.text;

          if (!this.isSpecificInterface(path)) {
            return;
          }

          if (propToTraverse) {
            if (path === propToTraverse) {
              this.traverseInterface(type, output, sourceFile, propToTraverse);
            }
          } else {
            this.traverseInterface(type, output, sourceFile, undefined, path);
          }
          break;

        default:
          break;
      }

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }

  gatherTypes(sourceFile: ts.SourceFile) {
    const processNode = (node: ts.Node) => {
      const name = (node as ts.DeclarationStatement).name;
      const text = name ? name.text : '';

      const aliasedTo = _.get(node, 'type.kind', node.kind);

      this.types[text] = {kind: node.kind, aliasedTo};

      ts.forEachChild(node, processNode);
    };

    processNode(sourceFile);
  }

  async generate() {
    const output: Output = {};
    const fileContents = await this.readFiles();
    fileContents.forEach((f: FileTuple) => {
      this.gatherTypes(
          ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true));
    });

    fileContents.forEach((f: FileTuple) => {
      this.processFile(
          ts.createSourceFile(f[0], f[1], ts.ScriptTarget.ES2015, true),
          output);
    });

    return output;
  }
}
