import { useEffect, useState } from "react";
import { api } from "./axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

function OrdersComponent() {
  const [orders, setOrders] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    timestamp: new Date().toISOString(),
    status: "new",
    priority: 0,
    total_amount: 0,
    table_number: "",
    kitchen_area_id: "",
    items: [],
  });

  useEffect(() => {
    fetchOrders();
    fetchKitchens();
    fetchItems();
  }, []);

  useEffect(() => {
    const calculateTotal = () => {
      const total = currentOrder.items.reduce((acc, item) => {
        const itemDetails = items.find((it) => it.id === item.id);
        return acc + item.quantity * (itemDetails?.price || 0);
      }, 0);
      setCurrentOrder((prev) => ({ ...prev, total_amount: total }));
    };

    if (items.length > 0) {
      calculateTotal();
    }
  }, [currentOrder.items, items]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  const fetchKitchens = async () => {
    try {
      const response = await api.get("/kitchen");
      setKitchens(response.data);
    } catch (error) {
      console.error("Failed to fetch kitchens", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("/items/plain");
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  const handleOpen = (order) => {
    if (order.id) {
      setCurrentOrder(order);
    } else {
      setCurrentOrder({
        timestamp: new Date().toISOString(),
        status: "new",
        priority: 0,
        total_amount: "",
        table_number: "",
        kitchen_area_id: "",
        items: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setCurrentOrder({
      timestamp: new Date().toISOString(),
      status: "new",
      priority: 0,
      total_amount: "",
      table_number: "",
      kitchen_area_id: "",
      items: [],
    });
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...currentOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setCurrentOrder((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setCurrentOrder((prev) => ({
      ...prev,
      items: [...prev.items, { id: items[0]?.id, quantity: 1, notes: "" }],
    }));
  };

  const removeItem = (index) => {
    setCurrentOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleCreateUpdateOrder = async () => {
    const method = currentOrder.id ? "put" : "post";
    const endpoint = currentOrder.id ? `/orders/${currentOrder.id}` : "/orders/new";

    try {
      await api[method](endpoint, currentOrder);
      fetchOrders();
      handleClose();
    } catch (error) {
      console.error("Failed to create/update order", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order", error);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => handleOpen({})}>
        Create Order
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.total_amount}</TableCell>
                <TableCell>{order.priority}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(order)}>Edit</Button>
                  <Button onClick={() => handleDelete(order.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{currentOrder.id ? "Edit Order" : "New Order"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Total Amount"
                margin="normal"
                variant="outlined"
                fullWidth
                name="total_amount"
                type="number"
                disabled={true}
                value={currentOrder.total_amount}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Table Number"
                margin="normal"
                variant="outlined"
                fullWidth
                name="table_number"
                type="number"
                value={currentOrder.table_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Kitchen Area</InputLabel>
                <Select
                  label="kitchen area"
                  value={currentOrder.kitchen_area_id}
                  onChange={(e) => handleChange({ target: { name: "kitchen_area_id", value: e.target.value } })}
                  name="kitchen_area_id"
                >
                  {kitchens.map((kitchen) => (
                    <MenuItem key={kitchen.id} value={kitchen.id}>
                      {kitchen.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Status"
                  value={currentOrder.status}
                  onChange={(e) => handleChange({ target: { name: "status", value: e.target.value } })}
                  name="status"
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="assigned to kitchen">Assigned to Kitchen</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="serve">Serve</MenuItem>
                  <MenuItem value="packed">Packed</MenuItem>
                  <MenuItem value="pickedup">Picked Up</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Priority"
                margin="normal"
                variant="outlined"
                fullWidth
                name="priority"
                type="number"
                value={currentOrder.priority}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={addItem} color="primary" variant="outlined">
                Add Item
              </Button>
              {currentOrder.items.map((item, index) => (
                <Grid container spacing={1} key={index} alignItems="center">
                  <Grid item xs={5}>
                    <FormControl margin="normal" fullWidth>
                      <InputLabel>Item</InputLabel>
                      <Select label="item" value={item.id} onChange={(e) => handleItemChange(index, "id", e.target.value)}>
                        {items.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Quantity"
                      margin="normal"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      margin="normal"
                      label="Notes"
                      value={item.notes}
                      onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item margin="normal" xs={1}>
                    <Button onClick={() => removeItem(index)} color="error" variant="contained">
                      X
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateUpdateOrder}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default OrdersComponent;
