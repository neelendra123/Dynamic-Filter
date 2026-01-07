import React from 'react';
import { 
  TextField, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText, 
  Switch, 
  FormControlLabel, 
  Box, 
  InputAdornment 
} from '@mui/material';
import type { FieldType, Operator } from '../types'; // Type-only import

interface DynamicInputProps {
  type: FieldType;
  operator: Operator;
  value: any;
  onChange: (value: any) => void;
  options?: string[];
}

export const DynamicInput: React.FC<DynamicInputProps> = ({ type, operator, value, onChange, options = [] }) => {
  
  // Common styles for consistent width
  const inputStyle = { minWidth: 150, backgroundColor: 'white' };

  // 1. Boolean Input
  if (type === 'boolean') {
    return (
      <FormControlLabel
        control={<Switch checked={!!value} onChange={(e) => onChange(e.target.checked)} color="primary" />}
        label={value ? "True" : "False"}
        sx={{ ml: 1 }}
      />
    );
  }

  // 2. Date Range Input (Between)
  if (type === 'date' && operator === 'between') {
    return (
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          type="date"
          size="small"
          value={Array.isArray(value) ? value[0] : ''}
          onChange={(e) => onChange([e.target.value, Array.isArray(value) ? value[1] : ''])}
          sx={inputStyle}
          InputLabelProps={{ shrink: true }}
          label="From"
        />
        <Box component="span" sx={{ color: 'text.secondary' }}>-</Box>
        <TextField
          type="date"
          size="small"
          value={Array.isArray(value) ? value[1] : ''}
          onChange={(e) => onChange([Array.isArray(value) ? value[0] : '', e.target.value])}
          sx={inputStyle}
          InputLabelProps={{ shrink: true }}
          label="To"
        />
      </Box>
    );
  }

  // 3. Amount/Number Range (Between)
  if ((type === 'amount' || type === 'number') && operator === 'between') {
    return (
      <Box display="flex" gap={1} alignItems="center">
        <TextField
          type="number"
          label="Min"
          size="small"
          value={Array.isArray(value) ? value[0] : ''}
          onChange={(e) => onChange([Number(e.target.value), Array.isArray(value) ? value[1] : 0])}
          sx={{ width: 100, bgcolor: 'white' }}
          InputProps={type === 'amount' ? {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          } : undefined}
        />
        <Box component="span" sx={{ color: 'text.secondary' }}>-</Box>
        <TextField
          type="number"
          label="Max"
          size="small"
          value={Array.isArray(value) ? value[1] : ''}
          onChange={(e) => onChange([Array.isArray(value) ? value[0] : 0, Number(e.target.value)])}
          sx={{ width: 100, bgcolor: 'white' }}
          InputProps={type === 'amount' ? {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          } : undefined}
        />
      </Box>
    );
  }

  // 4. Multi-Select Input
  if (type === 'multiSelect' || operator === 'in' || operator === 'notIn') {
     return (
      <Select
        multiple
        size="small"
        value={Array.isArray(value) ? value : []}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) => (selected as string[]).join(', ')}
        sx={{ ...inputStyle, minWidth: 220 }}
        displayEmpty
      >
        <MenuItem disabled value="">
          <em>Select Options</em>
        </MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            <Checkbox size="small" checked={Array.isArray(value) && value.indexOf(opt) > -1} />
            <ListItemText primary={opt} />
          </MenuItem>
        ))}
      </Select>
     );
  }

  // 5. Single Select
  if (type === 'singleSelect') {
    return (
      <Select 
        size="small" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        sx={inputStyle}
        displayEmpty
      >
        <MenuItem disabled value="">
          <em>Select Option</em>
        </MenuItem>
        {options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
      </Select>
    );
  }

  // 6. Default Text/Number Input
  return (
    <TextField
      type={type === 'number' || type === 'amount' ? 'number' : 'text'}
      size="small"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type value..."
      sx={inputStyle}
      InputProps={type === 'amount' ? {
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      } : undefined}
    />
  );
};