import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
} from "@mui/material";
import { api } from "./axios";

function UnifiedMenuManager() {
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState({ name: "", description: "", active: 1, itemIds: [] });
  const [open, setOpen] = useState(false);

  const fetchMenus = async () => {
    const response = await api.get("/menu");
    setMenus(response.data);
  };

  const fetchItems = async () => {
    const response = await api.get("/items/plain");
    setItems(response.data);
  };

  useEffect(() => {
    fetchMenus();
    fetchItems();
  }, []);

  const handleOpen = (menu = { name: "", description: "", active: 1, itemIds: [] }) => {
    setSelectedMenu(menu);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    fetchMenus();
  };

  const handleDelete = async (id) => {
    await api.delete(`/menu/${id}`);
    fetchMenus();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedMenu({ ...selectedMenu, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...selectedMenu, active: selectedMenu.active ? 1 : 0 };
    if (selectedMenu.id) {
      await api.put(`/menu/${selectedMenu.id}`, payload);
    } else {
      await api.post("/menu/new", payload);
    }
    handleClose();
  };

  return (
    <div>
      <Button onClick={() => handleOpen()} variant="contained" color="primary" style={{ marginBottom: "10px" }}>
        Add Menu
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menus.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell>{menu.name}</TableCell>
                <TableCell>{menu.description}</TableCell>
                <TableCell>{menu.active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(menu)}>Edit</Button>
                  <Button onClick={() => handleDelete(menu.id)} color="error">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedMenu.id ? "Edit Menu" : "Create Menu"}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField label="Name" name="name" value={selectedMenu.name} onChange={handleChange} fullWidth margin="normal" />
            <TextField
              label="Description"
              name="description"
              value={selectedMenu.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Items</InputLabel>
              <Select
                multiple
                value={selectedMenu.itemIds}
                onChange={(e) => handleChange({ target: { name: "itemIds", value: e.target.value } })}
                input={<OutlinedInput label="Items" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Checkbox checked={selectedMenu.itemIds.indexOf(item.id) > -1} />
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="primary">
                {selectedMenu.id ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UnifiedMenuManager;
