import { useState, useMemo, useEffect } from 'react';
import { 
  Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Box, Button, Typography 
} from '@mui/material';
import { Download, RotateCcw } from 'lucide-react'; // Import icons
import { FilterBuilder } from './components/FilterBuilder';
import { generateMockData, applyFilters, getNestedValue } from './utils';
import type { Employee, Filter, FieldDefinition } from './types'; // Type-only imports

const FIELD_DEFINITIONS: FieldDefinition[] = [
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'role', label: 'Role', type: 'singleSelect', options: ['Junior Dev', 'Senior Dev', 'Manager', 'Director', 'Intern'] },
  { id: 'salary', label: 'Salary', type: 'amount' },
  { id: 'joinDate', label: 'Join Date', type: 'date' },
  { id: 'isActive', label: 'Active Status', type: 'boolean' },
  { id: 'address.city', label: 'City', type: 'singleSelect', options: ['San Francisco', 'New York'] },
  { id: 'skills', label: 'Skills', type: 'text' },
];

function App() {
  const [data, setData] = useState<Employee[]>([]);

  // 1. PERSISTENCE: Lazy Initialization
  // We check localStorage *before* the component renders the first time
  const [filters, setFilters] = useState<Filter[]>(() => {
    const saved = localStorage.getItem('tableFilters');
    return saved ? JSON.parse(saved) : [];
  });

  // Load Data
  useEffect(() => {
    setData(generateMockData(50));
  }, []);

  // 2. PERSISTENCE: Save on Change
  // Whenever 'filters' changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('tableFilters', JSON.stringify(filters));
  }, [filters]);

  const filteredData = useMemo(() => {
    return applyFilters(data, filters);
  }, [data, filters]);

  // 3. EXPORT FUNCTIONALITY
  const handleExport = () => {
    // A. Define the headers
    const headers = ['Name', 'Role', 'Department', 'Salary', 'City', 'Join Date', 'Active'];
    
    // B. Map the data to CSV rows
    const rows = filteredData.map(row => [
      `"${row.name}"`, // Quote strings to handle commas inside names
      `"${row.role}"`,
      `"${row.department}"`,
      row.salary,
      `"${getNestedValue(row, 'address.city')}"`,
      row.joinDate,
      row.isActive ? 'Yes' : 'No'
    ]);

    // C. Combine into a CSV string
    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.join(','))
    ].join('\n');

    // D. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters([]);
    localStorage.removeItem('tableFilters');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Employee Directory</Typography>
        <Box display="flex" gap={2}>
           {/* Clear Button */}
           <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<RotateCcw size={16} />}
            onClick={clearFilters}
            disabled={filters.length === 0}
          >
            Reset Filters
          </Button>
          {/* Export Button */}
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<Download size={16} />}
            onClick={handleExport}
            disabled={filteredData.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <FilterBuilder 
        filters={filters} 
        fields={FIELD_DEFINITIONS} 
        onFilterChange={setFilters} 
      />

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>${row.salary.toLocaleString()}</TableCell>
                  <TableCell>{getNestedValue(row, 'address.city')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.isActive ? 'Active' : 'Inactive'} 
                      color={row.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No results found matching your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> records
          </Typography>
        </Box>
      </TableContainer>
    </Container>
  );
}

export default App;