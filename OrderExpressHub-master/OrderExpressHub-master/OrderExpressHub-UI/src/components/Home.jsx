import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, IconButton, TextField, Modal, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { api } from "./axios";

function UserProfile() {
  useEffect(() => {
    if (!localStorage.getItem("hasRefreshed")) {
      localStorage.setItem("hasRefreshed", "true");
      window.location.reload();
    }
    const timer = setTimeout(() => {
      localStorage.removeItem("hasRefreshed");
      console.log("Refresh flag cleared after 5 seconds.");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [editableUser, setEditableUser] = useState({});
  const [kitchenAreas, setKitchenAreas] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    password: "",
    role: "",
  });
  const user_id = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");
  const isManager = role === "manager";

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await api.get(`/profile/${user_id}`);
        setEditableUser(res.data);
        localStorage.setItem("kitchen_area_id", res.data.kitchen_area_id);
        fetchKitchenAreas();
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    }

    async function fetchKitchenAreas() {
      try {
        const response = await api.get("/kitchen");
        setKitchenAreas(response.data);
      } catch (error) {
        console.error("Error fetching kitchen areas:", error);
      }
    }

    getProfile();
  }, [user_id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("kitchen_area_id");
    navigate("/login");
  };

  const handleFieldChange = (field) => (event) => {
    setEditableUser((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const saveChanges = async () => {
    try {
      await api.put(`/profile/${user_id}`, editableUser);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save changes", error);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleNewEmployeeChange = (prop) => (event) => {
    setNewEmployee((prev) => ({ ...prev, [prop]: event.target.value }));
  };

  const submitNewEmployee = async () => {
    try {
      await api.post("/profile/new", newEmployee);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to add new employee", error);
    }
  };

  return (
    <>
      {isManager && (
        <Button color="primary" onClick={handleOpenModal} variant="contained" style={{ marginLeft: "50px" }}>
          Add New Employee
        </Button>
      )}
      <Button color="error" style={{ float: "right", marginRight: "50px" }} variant="contained" onClick={handleLogout}>
        Log Out
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: 2,
          padding: 2,
          border: "1px solid #ccc",
          borderRadius: "4px",
          maxWidth: 600,
          mx: "auto",
        }}
      >
        <TextField label="Email" value={editableUser.email || ""} margin="normal" fullWidth disabled />
        <TextField label="Role" value={role || ""} margin="normal" fullWidth disabled />
        <TextField
          label="Full Name"
          value={editableUser.full_name || ""}
          onChange={handleFieldChange("full_name")}
          margin="normal"
          fullWidth
          disabled={!editMode}
        />
        <TextField
          label="Phone Number"
          value={editableUser.phone_number || ""}
          onChange={handleFieldChange("phone_number")}
          margin="normal"
          fullWidth
          disabled={!editMode}
        />
        <TextField
          label="Address"
          value={editableUser.address || ""}
          onChange={handleFieldChange("address")}
          margin="normal"
          fullWidth
          disabled={!editMode}
        />
        {role !== "manager" && role !== "waitstaff" && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="kitchen-area-label">Kitchen Area</InputLabel>
            <Select
              labelId="kitchen-area-label"
              id="kitchen-area-select"
              value={editableUser.kitchen_area_id || ""}
              onChange={handleFieldChange("kitchen_area_id")}
              label="Kitchen Area"
              disabled={!editMode}
            >
              {kitchenAreas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {!editMode ? (
          <IconButton onClick={toggleEditMode} color="primary">
            <EditIcon />
          </IconButton>
        ) : (
          <>
            <IconButton onClick={toggleEditMode} color="secondary">
              <CancelIcon />
            </IconButton>
            <IconButton onClick={saveChanges} color="primary">
              <SaveIcon />
            </IconButton>
          </>
        )}
        <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add New Employee
            </Typography>
            <TextField label="Email" value={newEmployee.email} onChange={handleNewEmployeeChange("email")} margin="normal" fullWidth />
            <TextField
              label="Password"
              type="password"
              value={newEmployee.password}
              onChange={handleNewEmployeeChange("password")}
              margin="normal"
              fullWidth
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role-select"
                value={newEmployee.role}
                label="Role"
                onChange={handleNewEmployeeChange("role")}
              >
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="kitchenporter">Kitchen Porter</MenuItem>
                <MenuItem value="foodrunner">Food Runner</MenuItem>
                <MenuItem value="chef">Chef</MenuItem>
                <MenuItem value="waitstaff">Wait Staff</MenuItem>
              </Select>
            </FormControl>
            <Button color="primary" variant="contained" onClick={submitNewEmployee} sx={{ mt: 2 }}>
              Submit
            </Button>
          </Box>
        </Modal>
      </Box>
    </>
  );
}

export default UserProfile;
