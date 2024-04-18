import { useState, useEffect } from "react";
import { api } from "./axios";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const KitchenAreaManager = () => {
  const [kitchenAreas, setKitchenAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchKitchenAreas();
  }, []);

  const fetchKitchenAreas = async () => {
    try {
      const response = await api.get("/kitchen");
      setKitchenAreas(response.data);
    } catch (error) {
      console.error("Error fetching kitchen areas:", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = selectedArea ? "put" : "post";
    const url = selectedArea ? `/kitchen/${selectedArea.id}` : "/kitchen/new";

    try {
      await api[method](url, formData);
      fetchKitchenAreas();
      setFormData({ name: "", description: "" });
      setSelectedArea(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error submitting kitchen area:", error);
    }
  };

  const handleEdit = (area) => {
    setSelectedArea(area);
    setFormData({ name: area.name, description: area.description });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/kitchen/${id}`);
      fetchKitchenAreas();
    } catch (error) {
      console.error("Error deleting kitchen area:", error);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setSelectedArea(null);
          setFormData({ name: "", description: "" });
          setOpenDialog(true);
        }}
      >
        Add New Kitchen Area
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedArea ? "Edit Kitchen Area" : "Create Kitchen Area"}</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the name and description of the kitchen area.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{selectedArea ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {kitchenAreas.map((area) => (
            <TableRow key={area.id}>
              <TableCell>{area.name}</TableCell>
              <TableCell>{area.description}</TableCell>
              <TableCell>
                <Button color="primary" onClick={() => handleEdit(area)}>
                  Edit
                </Button>
                <Button color="secondary" onClick={() => handleDelete(area.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default KitchenAreaManager;
