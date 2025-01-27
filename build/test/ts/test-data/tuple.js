"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectedTuple1 = void 0;
const sampleOrderData = {
    'id': 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
    'name': 'consequuntur ab fugiat'
};
exports.expectedTuple1 = {
    'Order': sampleOrderData,
    'Test': {
        'pattern1': [sampleOrderData, sampleOrderData],
        'pattern2': [
            sampleOrderData, sampleOrderData, sampleOrderData, sampleOrderData,
            sampleOrderData
        ],
        'pattern3': [
            86924, sampleOrderData, [false, 4649, 3939, true],
            'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
            'hello world', 123.456, true, false, 86924, 86924, 86924
        ]
    }
};
//# sourceMappingURL=tuple.js.map