import React from "react";
import { AppBar, Toolbar, IconButton, Tooltip, Typography } from "@mui/material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CategoryIcon from "@mui/icons-material/Category";
import FilterListIcon from "@mui/icons-material/FilterList";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import BlindsClosedIcon from "@mui/icons-material/BlindsClosed";

const role = localStorage.getItem("role");

const menuItems = [
  { text: "Profile", icon: <AccountCircleIcon fontSize="large" />, path: "/" },
  { text: "Categories", icon: <CategoryIcon fontSize="large" />, path: "/categories", roles: ["manager", "chef"] },
  { text: "Items", icon: <FilterListIcon fontSize="large" />, path: "/items", roles: ["manager", "chef"] },
  { text: "Menus", icon: <ListAltIcon fontSize="large" />, path: "/menus", roles: ["manager", "chef"] },
  { text: "Kitchen Areas", icon: <SoupKitchenIcon fontSize="large" />, path: "/kitchen", roles: ["manager"] },
  { text: "Orders", icon: <AddBusinessIcon fontSize="large" />, path: "/orders", roles: ["manager", "chef", "waitstaff"] },
  { text: "Board", icon: <StickyNote2Icon fontSize="large" />, path: "/board", roles: ["manager", "kitchenporter", "foodrunner", "chef"] },
  { text: "Closing Stats", icon: <BlindsClosedIcon fontSize="large" />, path: "/report", roles: ["manager"] },
].filter((item) => !item.roles || item.roles.includes(role));

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <React.Fragment>
      <AppBar position="static" style={{ flexGrow: 1 }}>
        <Toolbar style={{ justifyContent: "space-evenly" }}>
          {menuItems.map((item, index) => (
            <Tooltip key={index} title={item.text} enterDelay={300} leaveDelay={100} arrow placement="bottom">
              <IconButton
                color="inherit"
                onClick={() => navigate(item.path)}
                style={{
                  padding: "15px",
                  backgroundColor: location.pathname === item.path ? "#f0f0f047" : "transparent",
                }}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Toolbar>
      </AppBar>
      <Typography component="div" style={{ padding: 8 }}>
        <Outlet />
      </Typography>
    </React.Fragment>
  );
};

export default Navigation;
