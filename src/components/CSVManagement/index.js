// src/components/CSVManagement/index.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
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

// API service for CSV operations using axios
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
const CSVEditor = ({ csvId }) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [csvName, setCsvName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.getCSVData(csvId);
      const { columns } = await apiService.getCSVSchema(csvId);
      
      // Create DataGrid columns configuration
      const gridColumns = columns.map(col => ({
        field: col,
        headerName: col.charAt(0).toUpperCase() + col.slice(1).replace('_', ' '),
        flex: 1,
        editable: false
      }));
      
      // Add action column
      gridColumns.push({
        field: 'actions',
        headerName: 'Actions',
        flex: 1,
        renderCell: (params) => (
          <Box>
            <IconButton 
              color="primary" 
              onClick={() => handleEdit(params.row, params.id)}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              color="error" 
              onClick={() => handleDelete(params.id)}
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fixed useEffect dependency array to include fetchData
  useEffect(() => {
    fetchData();
  }, [csvId, fetchData]);

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
    setOpenDialog(true);
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
    setOpenDialog(true);
  };

  const handleDelete = async (rowIndex) => {
    try {
      await apiService.deleteCSVRow(csvId, rowIndex);
      // Refresh data
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
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
                // Disable timestamp field for edits if it exists
                disabled={col.field === 'timestamp' && dialogMode === 'edit'}
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
  return (
    <Container maxWidth="xl">
      <Routes>
        <Route path="/" element={<CSVList />} />
        <Route path="/:csvId" element={<CSVEditorWrapper />} />
      </Routes>
    </Container>
  );
};

// Wrapper to get params from route
const CSVEditorWrapper = () => {
  const location = window.location.pathname;
  const csvId = location.split('/').pop();
  
  return <CSVEditor csvId={csvId} />;
};

export default CSVManagement;