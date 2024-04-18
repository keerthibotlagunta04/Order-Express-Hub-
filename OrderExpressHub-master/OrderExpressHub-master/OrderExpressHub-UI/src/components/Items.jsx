import { useState, useEffect } from "react";
import { api } from "./axios";
import {
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

function ItemsComponent() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", category_id: "" });
  const [editing, setEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/items/plain");
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/items/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleCreateOrUpdateItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category_id) {
      alert("Name, price, and category ID are required.");
      return;
    }
    const method = editing ? "put" : "post";
    const endpoint = editing ? `/items/${editItemId}` : "/items/new";

    try {
      const response = await api[method](endpoint, newItem);
      const updatedItems = editing
        ? items.map((item) => (item.id === editItemId ? { ...item, ...newItem } : item))
        : [...items, { ...newItem, id: response.data.id }];
      setItems(updatedItems);
      setNewItem({ name: "", description: "", price: "", category_id: "" });
      setEditing(false);
      setEditItemId(null);
    } catch (error) {
      console.error(`Failed to ${editing ? "update" : "create"} item:`, error);
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditItemId(item.id);
    setNewItem({ name: item.name, description: item.description, price: item.price, category_id: item.category_id });
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 4 }}>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Item Name"
          variant="outlined"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Description"
          variant="outlined"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Price"
          type="number"
          variant="outlined"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="category-label">Category</InputLabel>
        <Select
          labelId="category-label"
          value={newItem.category_id}
          label="Category"
          onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleCreateOrUpdateItem} sx={{ mt: 2 }}>
        {editing ? "Save Changes" : "Create Item"}
      </Button>
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>${item.price}</TableCell>
                <TableCell>{categories.find((c) => c.id === item.category_id)?.name}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(item)}>Edit</Button>
                  <Button onClick={() => handleDeleteItem(item.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ItemsComponent;
