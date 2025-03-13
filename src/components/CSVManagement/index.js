import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Alert,
  Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

// Set axios default base URL
axios.defaults.baseURL = 'https://kriya-backend.onrender.com/';

// API service for CSV operations
const apiService = {
  getCSVFiles: async () => {
    try {
      const response = await axios.get('/api/csv-files');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch CSV files');
    }
  },
  
  getCSVData: async (csvId) => {
    try {
      const response = await axios.get(`/api/csv/${csvId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch CSV data');
    }
  },
  
  getCSVSchema: async (csvId) => {
    try {
      const response = await axios.get(`/api/csv/${csvId}/schema`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch CSV schema');
    }
  },
  
  addCSVRow: async (csvId, rowData) => {
    try {
      const response = await axios.post(`/api/csv/${csvId}`, rowData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to add row');
    }
  },
  
  updateCSVRow: async (csvId, rowIndex, rowData) => {
    try {
      const response = await axios.put(`/api/csv/${csvId}/${rowIndex}`, rowData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update row');
    }
  },
  
  deleteCSVRow: async (csvId, rowIndex) => {
    try {
      const response = await axios.delete(`/api/csv/${csvId}/${rowIndex}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete row');
    }
  }
};

// CSV List Component
const CSVList = () => {
  const [csvFiles, setCSVFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCSVFiles = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCSVFiles();
        setCSVFiles(data.files);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCSVFiles();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        CSV Management
      </Typography>
      <Typography variant="body1" paragraph>
        Select a CSV file to view, edit, add, or delete data.
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mt: 3 }}>
        {csvFiles.map((file) => (
          <Paper 
            key={file.id} 
            elevation={3}
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.03)',
                bgcolor: 'rgba(156, 39, 176, 0.1)'
              }
            }}
            onClick={() => navigate(`/admin/csv/${file.id}`)}
          >
            <Typography variant="h6" gutterBottom>
              {file.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {file.id}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

// CSV Editor Component
const CSVEditor = () => {
  const { csvId } = useParams();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({}); // Added for validation errors
  const [csvName, setCsvName] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  // Sorting state
  const [sortModel, setSortModel] = useState([]);

  const handleDelete = async (rowIndex) => {
    try {
      await apiService.deleteCSVRow(csvId, rowIndex);
      // Refresh data after deletion
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (row, rowIndex) => {
    setDialogMode('edit');
    setEditRowIndex(rowIndex);
    
    // Initialize form with current values
    const initialForm = {};
    columns.forEach(col => {
      if (col.field !== 'actions' && col.field !== 'id') {
        initialForm[col.field] = row[col.field] || '';
      }
    });
    setFormData(initialForm);
    setFormErrors({}); // Reset errors when opening edit dialog
    setOpenDialog(true);
  };

  const fetchData = useCallback(async () => {
    if (!csvId) return;
    
    try {
      setLoading(true);
      const { data } = await apiService.getCSVData(csvId);
      const { columns } = await apiService.getCSVSchema(csvId);
      
      // Create DataGrid columns configuration
      const gridColumns = columns.map(col => ({
        field: col,
        headerName: col.charAt(0).toUpperCase() + col.slice(1).replace('_', ' '),
        flex: 1,
        editable: false,
        sortable: true // Enable sorting for all columns except actions
      }));
      
      // Add action column
      gridColumns.push({
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        sortable: false, // Actions column shouldn't be sortable
        renderCell: (params) => (
          <Box>
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row, params.id);
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      });
      
      // Add id field for DataGrid if not present
      const dataWithIds = data.map((row, index) => ({
        ...row,
        id: index
      }));
      
      setData(dataWithIds);
      setColumns(gridColumns);
      setCsvName(csvId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      setDataFetched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [csvId]);

  // Initial data fetch only once when component mounts or csvId changes
  useEffect(() => {
    if (csvId && !dataFetched) {
      fetchData();
    }
  }, [csvId, fetchData, dataFetched]);

  const handleAdd = () => {
    setDialogMode('add');
    // Initialize form with empty values for each column
    const initialForm = {};
    columns.forEach(col => {
      if (col.field !== 'actions' && col.field !== 'id') {
        initialForm[col.field] = '';
      }
    });
    setFormData(initialForm);
    setFormErrors({}); // Reset errors when opening add dialog
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({}); // Clear any error state when closing
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field as user is typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    columns.forEach(col => {
      if (col.field !== 'actions' && col.field !== 'id') {
        // Skip validation for timestamp field in edit mode
        if (!(col.field === 'timestamp' && dialogMode === 'edit')) {
          // Check if field is empty
          if (!formData[col.field] || formData[col.field].trim() === '') {
            errors[col.field] = `${col.headerName} is required`;
            isValid = false;
          }
        }
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      if (dialogMode === 'add') {
        await apiService.addCSVRow(csvId, formData);
      } else if (dialogMode === 'edit') {
        await apiService.updateCSVRow(csvId, editRowIndex, formData);
      }
      
      // Close dialog and refresh data
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handler for sort model changes
  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  if (!csvId) return null;
  if (loading && data.length === 0) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {csvName}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add New Row
        </Button>
      </Box>
      
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          loading={loading}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: Object.keys(data[0] || {}).find(key => key !== 'id' && key !== 'actions') || 'id',
                  sort: 'asc',
                },
              ],
            },
          }}
        />
      </Paper>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Row' : 'Edit Row'}
        </DialogTitle>
        <DialogContent>
          {columns
            .filter(col => col.field !== 'actions' && col.field !== 'id')
            .map((col) => (
              <TextField
                key={col.field}
                margin="dense"
                name={col.field}
                label={col.headerName}
                type="text"
                fullWidth
                variant="outlined"
                value={formData[col.field] || ''}
                onChange={handleFormChange}
                disabled={col.field === 'timestamp' && dialogMode === 'edit'}
                error={Boolean(formErrors[col.field])}
                helperText={formErrors[col.field] || ''}
                required={!(col.field === 'timestamp' && dialogMode === 'edit')}
              />
            ))
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Main CSV Management Component
const CSVManagement = () => {
  const location = useLocation();
  const { csvId } = useParams();
  
  return (
    <Container maxWidth="xl">
      {!csvId ? <CSVList /> : <CSVEditor />}
    </Container>
  );
};

export default CSVManagement;