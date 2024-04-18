import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { api } from "./axios";

function OrderReport() {
  const [orders, setOrders] = useState([]);
  const [kitchenAreas, setKitchenAreas] = useState({});

  useEffect(() => {
    api
      .get("/orders")
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  useEffect(() => {
    api
      .get("/kitchen")
      .then((response) => {
        const kitchenMap = {};
        response.data.forEach((kitchen) => {
          kitchenMap[kitchen.id] = kitchen.name;
        });
        setKitchenAreas(kitchenMap);
      })
      .catch((error) => console.error("Error fetching kitchen areas:", error));
  }, []);

  return (
    <>
      <h1>Closing Stats</h1>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Kitchen Area</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {order.id}
                </TableCell>
                <TableCell align="right">{order.status}</TableCell>
                <TableCell align="right">{order.total_amount}</TableCell>
                <TableCell align="right">{kitchenAreas[order.kitchen_area_id] || "Loading..."}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default OrderReport;
