import ts from 'typescript';
import { Options, Output, Types } from '../lang/ts/intermock';
/**
 * Process an importSpecifier or exportSpecifier and set it.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 * @param output The object outputted by Intermock after all types are mocked
 * @param types Top-level types of interfaces/aliases etc.
 * @param typeName Type name of property
 * @param property Output property to write to
 * @param options Intermock general options object
 */
export declare function setImportExportSpecifier(sourceFile: ts.SourceFile, output: Output, types: Types, typeName: string, property: string, options: Options): void;
