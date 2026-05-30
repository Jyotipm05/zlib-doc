/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Parameter {
  name: string;
  type: string;
  description: string;
}

export interface ReturnValue {
  type: string;
  description: string;
}

export interface Equivalent {
  language: string;
  code: string;
  description?: string;
}

export interface DocItem {
  id: string;
  name: string;
  category: string;
  type: 'function' | 'type' | 'constant' | 'guide';
  summary: string;
  description: string;
  signature?: string;
  parameters?: Parameter[];
  returns?: ReturnValue;
  equivalents?: Equivalent[];
  codeSampleUrl?: string;
  relatedIds?: string[];
}

export type ActiveSection = 
  | 'intro'
  | 'install'
  | 'quickstart-cpp'
  | 'quickstart-node'
  | 'formats'
  | 'playground'
  // Category fallbacks or specific API IDs
  | string;

export interface CategoryGroup {
  id: string;
  title: string;
  items: { id: string; name: string; type: 'function' | 'type' | 'constant' | 'guide' }[];
}
