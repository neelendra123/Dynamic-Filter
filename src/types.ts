// src/types.ts

// 1. Operators
export type Operator =
  | 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'doesNotContain'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'between'
  | 'is' | 'isNot'
  | 'in' | 'notIn';

// 2. Field Types (THIS WAS LIKELY MISSING)
export type FieldType = 'text' | 'number' | 'date' | 'amount' | 'singleSelect' | 'multiSelect' | 'boolean';

// 3. Interfaces
export interface Filter {
  id: string;
  fieldId: string;
  operator: Operator;
  value: any;
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  skills: string[];
  address: {
    city: string;
    state: string;
    country: string;
  };
  projects: number;
  lastReview: string;
  performanceRating: number;
}