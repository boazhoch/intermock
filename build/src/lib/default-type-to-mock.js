"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTypeToMock = exports.supportedPrimitiveTypes = void 0;
const tslib_1 = require("tslib");
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
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const fake_1 = require("./fake");
exports.supportedPrimitiveTypes = {
    [typescript_1.default.SyntaxKind.NumberKeyword]: true,
    [typescript_1.default.SyntaxKind.StringKeyword]: true,
    [typescript_1.default.SyntaxKind.BooleanKeyword]: true,
    [typescript_1.default.SyntaxKind.ObjectKeyword]: true,
    [typescript_1.default.SyntaxKind.AnyKeyword]: true,
};
/* tslint:disable */
exports.defaultTypeToMock = {
    [typescript_1.default.SyntaxKind.NumberKeyword]: (isFixedMode = false) => parseInt(fake_1.fake('random.number', isFixedMode), 10),
    [typescript_1.default.SyntaxKind.StringKeyword]: (isFixedMode = false) => fake_1.fake('lorem.text', isFixedMode),
    [typescript_1.default.SyntaxKind.BooleanKeyword]: (isFixedMode = false) => JSON.parse(fake_1.fake('random.boolean', isFixedMode)),
    [typescript_1.default.SyntaxKind.ObjectKeyword]: (isFixedMode = false) => {
        return {};
    },
    [typescript_1.default.SyntaxKind.AnyKeyword]: (isFixedMode = false) => '',
};
/* tslint:enable */ 
//# sourceMappingURL=default-type-to-mock.js.map