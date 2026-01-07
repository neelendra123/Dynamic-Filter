import React from 'react';
import { Paper, IconButton, Select, MenuItem, Button, Box, Typography } from '@mui/material';
import { Trash2, Plus, Filter as FilterIcon } from 'lucide-react';
import type { Filter, FieldDefinition, Operator } from '../types';
import { DynamicInput } from './DynamicInput';

interface FilterBuilderProps {
  filters: Filter[];
  fields: FieldDefinition[];
  onFilterChange: (filters: Filter[]) => void;
}

const getOperatorsForType = (type: string): Operator[] => {
  switch (type) {
    case 'text': return ['contains', 'equals', 'startsWith', 'endsWith', 'doesNotContain'];
    case 'number': return ['equals', 'gt', 'lt', 'between'];
    case 'amount': return ['between', 'equals', 'gt', 'lt'];
    case 'date': return ['between']; 
    case 'boolean': return ['is'];
    case 'singleSelect': return ['is', 'isNot'];
    case 'multiSelect': return ['in', 'notIn'];
    default: return ['equals'];
  }
};

export const FilterBuilder: React.FC<FilterBuilderProps> = ({ filters, fields, onFilterChange }) => {
  
  const addFilter = () => {
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      fieldId: fields[0].id,
      operator: getOperatorsForType(fields[0].type)[0],
      value: ''
    };
    onFilterChange([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    onFilterChange(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    onFilterChange(filters.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, ...updates };
      
      // Reset value if field changes to maintain type safety
      if (updates.fieldId) {
        const field = fields.find(field => field.id === updates.fieldId);
        updated.operator = getOperatorsForType(field!.type)[0];
        updated.value = ''; 
      }
      return updated;
    }));
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterIcon size={20} color="#666" />
          <Typography variant="h6" color="text.primary">Filters</Typography>
        </Box>
        <Button 
          startIcon={<Plus size={16} />} 
          variant="contained" 
          onClick={addFilter}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Add Condition
        </Button>
      </Box>

      {filters.length === 0 && (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: '#f9fafb', 
            borderRadius: 2, 
            border: '1px dashed #e0e0e0' 
          }}
        >
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No filters active. Data is unfiltered.
          </Typography>
        </Box>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        {filters.map((filter, index) => {
          const fieldDef = fields.find(f => f.id === filter.fieldId);
          if (!fieldDef) return null;

          return (
            <Box 
              key={filter.id} 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center', 
                flexWrap: 'wrap',
                p: 2,
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #eee',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#ccc', bgcolor: '#fff' }
              }}
            >
              <Typography variant="caption" sx={{ color: '#888', minWidth: 40, fontWeight: 600 }}>
                {index === 0 ? 'WHERE' : 'AND'}
              </Typography>
              
              {/* Field Selector */}
              <Select
                size="small"
                value={filter.fieldId}
                onChange={(e) => updateFilter(filter.id, { fieldId: e.target.value })}
                sx={{ minWidth: 160, bgcolor: 'white' }}
              >
                {fields.map(f => <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>)}
              </Select>

              {/* Operator Selector */}
              <Select
                size="small"
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, { operator: e.target.value as Operator })}
                sx={{ minWidth: 140, bgcolor: 'white' }}
              >
                {getOperatorsForType(fieldDef.type).map(op => (
                  <MenuItem key={op} value={op}>{op.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</MenuItem>
                ))}
              </Select>

              {/* Dynamic Value Input */}
              <Box flexGrow={1}>
                <DynamicInput 
                  type={fieldDef.type}
                  operator={filter.operator}
                  value={filter.value}
                  options={fieldDef.options}
                  onChange={(val) => updateFilter(filter.id, { value: val })}
                />
              </Box>

              <IconButton onClick={() => removeFilter(filter.id)} color="error" size="small" sx={{ ml: 'auto' }}>
                <Trash2 size={18} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};