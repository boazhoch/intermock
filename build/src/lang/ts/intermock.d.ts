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
import ts from 'typescript';
/**
 * Intermock general options
 */
export interface Options {
    files?: Array<[string, string]>;
    language?: SupportedLanguage;
    interfaces?: string[];
    isFixedMode?: boolean;
    output?: OutputType;
    isOptionalAlwaysEnabled?: boolean;
    importsResolver?: Function;
}
declare type SupportedLanguage = 'typescript';
export declare type OutputType = 'object' | 'json' | 'string';
declare type TypeCacheRecord = {
    kind: ts.SyntaxKind;
    aliasedTo: ts.SyntaxKind;
    node: ts.Node;
};
export declare type Output = Record<string | number, {}>;
export declare type Types = Record<string, TypeCacheRecord>;
/**
 * Intermock API.
 *
 * Given an options object, with a files array property, Intermock parses the
 * AST and generates mock objects with fake data.
 *
 * This is the only part of the API exposed to a caller (including the CLI).
 * All data is passed through the `files` property on the options object.
 *
 * @param options Intermock general options object
 */
export declare function mock(options: Options): string | Record<string | number, {}>;
export {};
