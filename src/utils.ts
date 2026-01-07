import type { Employee, Filter, FieldDefinition } from './types';

// Helper to access nested properties safely (e.g., "address.city")
export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// --- Mock Data Generator ---
const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Product'];
const roles = ['Junior Dev', 'Senior Dev', 'Manager', 'Director', 'Intern'];
const skillsList = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Python', 'Java', 'Docker'];

export const generateMockData = (count: number = 50): Employee[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[i % departments.length],
    role: roles[i % roles.length],
    salary: 50000 + (i * 1200),
    joinDate: new Date(2020, i % 12, (i % 28) + 1).toISOString().split('T')[0],
    isActive: i % 5 !== 0, // Every 5th is inactive
    skills: [skillsList[i % skillsList.length], skillsList[(i + 2) % skillsList.length]],
    address: {
      city: i % 2 === 0 ? 'San Francisco' : 'New York',
      state: i % 2 === 0 ? 'CA' : 'NY',
      country: 'USA'
    },
    projects: (i % 10) + 1,
    lastReview: new Date(2024, 0, 15).toISOString().split('T')[0],
    performanceRating: 3 + (i % 20) / 10 // 3.0 to 4.9
  }));
};

// --- Core Filtering Logic ---
export const applyFilters = (data: Employee[], filters: Filter[]): Employee[] => {
  if (filters.length === 0) return data;

  // Group filters by fieldId to implement: (Field A Condition 1 OR Field A Condition 2) AND (Field B...)
  const groupedFilters = filters.reduce((acc, filter) => {
    if (!acc[filter.fieldId]) acc[filter.fieldId] = [];
    acc[filter.fieldId].push(filter);
    return acc;
  }, {} as Record<string, Filter[]>);

  return data.filter((item) => {
    // Iterate over every FIELD group
    return Object.values(groupedFilters).every((group) => {
      // Inside a group, at least one condition must be true (OR logic)
      return group.some((filter) => {
        const itemValue = getNestedValue(item, filter.fieldId);
        
        switch (filter.operator) {
          // Text
          case 'equals': return String(itemValue).toLowerCase() === String(filter.value).toLowerCase();
          case 'contains': return String(itemValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith': return String(itemValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith': return String(itemValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'doesNotContain': return !String(itemValue).toLowerCase().includes(String(filter.value).toLowerCase());
          
          // Number & Amount
          case 'gt': return Number(itemValue) > Number(filter.value);
          case 'lt': return Number(itemValue) < Number(filter.value);
          case 'gte': return Number(itemValue) >= Number(filter.value);
          case 'lte': return Number(itemValue) <= Number(filter.value);
          case 'between': // Expects value to be [min, max]
             return Number(itemValue) >= filter.value[0] && Number(itemValue) <= filter.value[1];
          
          // Boolean / Select
          case 'is': return itemValue === filter.value;
          case 'isNot': return itemValue !== filter.value;
          
          // Multi-Select (Arrays)
          case 'in': // Check if Item Value (e.g. 'Engineering') is in Filter Value list ['Eng', 'HR']
             return Array.isArray(filter.value) && filter.value.includes(itemValue);
          case 'notIn':
             return Array.isArray(filter.value) && !filter.value.includes(itemValue);
             
          // Array Fields (e.g. Skills contains 'React')
          // Note: This logic assumes 'contains' for array fields means "does the array contain this value?"
          // For this specific assessment, we map array field logic separately if needed.
          
          default: return true;
        }
      });
    });
  });
};