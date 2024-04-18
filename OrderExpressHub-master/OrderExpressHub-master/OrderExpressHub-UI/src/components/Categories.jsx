import { useState, useEffect } from "react";
import { api } from "./axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Box } from "@mui/material";

function CategoriesComponent() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState({ id: null, name: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await api.get("/items/categories");
    setCategories(response.data);
  };

  const handleCreateCategory = async () => {
    await api.post("/items/category/new", { name: newCategoryName });
    fetchCategories();
    setNewCategoryName("");
  };

  const handleUpdateCategory = async (id) => {
    await api.put(`/items/category/${id}`, { name: editingCategory.name });
    fetchCategories();
    setEditingCategory({ id: null, name: "" });
  };

  const handleDeleteCategory = async (id) => {
    await api.delete(`/items/category/${id}`);
    fetchCategories();
  };

  return (
    <div>
      <Box display="flex" alignItems="center" justifyContent="center" gap="10px">
        <TextField
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleCreateCategory}>
          Create Category
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>
                  {editingCategory.id === category.id ? (
                    <TextField
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      fullWidth
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>
                <TableCell>
                  {editingCategory.id === category.id ? (
                    <Button onClick={() => handleUpdateCategory(category.id)} color="primary">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => setEditingCategory({ id: category.id, name: category.name })} color="secondary">
                      Edit
                    </Button>
                  )}
                  <Button onClick={() => handleDeleteCategory(category.id)} color="error">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default CategoriesComponent;
