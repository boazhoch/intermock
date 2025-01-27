"use strict";
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockInterface = exports.mock = void 0;
const intermock_1 = require("./lang/ts/intermock");
function mock(options) {
    switch (options.language) {
        case 'typescript':
        default:
            return intermock_1.mock(options);
    }
}
exports.mock = mock;
exports.mockInterface = (optionsWithoutInterfaces) => {
    return (interfaces) => {
        return mock(Object.assign(Object.assign({}, optionsWithoutInterfaces), { interfaces }));
    };
};
//# sourceMappingURL=index.js.map