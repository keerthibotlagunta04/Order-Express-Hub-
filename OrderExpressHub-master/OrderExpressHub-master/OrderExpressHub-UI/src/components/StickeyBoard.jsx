import { useState, useEffect, useCallback } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { api } from "./axios";

const ItemTypes = {
  CARD: "card",
};

const sectionStyle = {
  padding: "10px",
  width: "100%",
  minHeight: "100px",
  border: "1px dashed #ccc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  outline: "none",
};

const DraggableCard = ({ order, onMove }) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: order.id },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onMove(item.id, dropResult.status);
      }
    },
  }));

  return (
    <div ref={drag}>
      <Paper elevation={3} style={{ padding: 10, margin: 5 }}>
        <Typography variant="h6">Table {order.table_number}</Typography>
        <Typography variant="body1">Status: {order.status}</Typography>
        <Typography variant="body2">Items: {order.items.map((item) => item.name).join(", ")}</Typography>
        <Typography variant="caption" style={{ color: "red" }}>
          Priority: {order.priority}
        </Typography>
      </Paper>
    </div>
  );
};

const Section = ({ status, children }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: () => ({ status }),
  }));

  return (
    <div ref={drop} style={sectionStyle}>
      {children}
    </div>
  );
};

const StickyBoard = () => {
  const role = localStorage.getItem("role");
  const kitchen_area_id = localStorage.getItem("kitchen_area_id");

  const [orders, setOrders] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!isDragging) {
      const response = await api.get("/orders");
      let sortedOrders = response.data.sort((a, b) => a.priority - b.priority);

      if (role !== "manager" && role !== "waitstaff") {
        sortedOrders = sortedOrders.filter((order) => order.kitchen_area_id == kitchen_area_id);
      }

      setOrders(sortedOrders);
    }
  }, [isDragging]);

  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const moveCard = async (id, newStatus) => {
    setIsDragging(true);
    await api.put(`/orders/status`, { id, status: newStatus });
    setIsDragging(false);
    fetchOrders();
  };

  let statuses = [];
  if (role == "foodrunner") {
    statuses = ["ready", "served", "packed", "pickedup", "closed"];
  } else if (role == "kitchenporter") {
    statuses = ["assigned to kitchen", "preparing", "ready"];
  } else {
    statuses = ["assigned to kitchen", "preparing", "ready", "served", "packed", "pickedup", "closed"];
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container spacing={2}>
        {statuses.map((status) => (
          <Grid key={status} item xs={12} sm={6} md>
            <Typography variant="h6">{status}</Typography>
            <Section status={status}>
              {orders
                .filter((order) => order.status === status)
                .map((order) => (
                  <DraggableCard key={order.id} order={order} onMove={moveCard} />
                ))}
            </Section>
          </Grid>
        ))}
      </Grid>
    </DndProvider>
  );
};

export default StickyBoard;
