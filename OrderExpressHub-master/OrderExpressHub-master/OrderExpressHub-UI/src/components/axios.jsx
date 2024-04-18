import { useState } from "react";
import axios from "axios";
import { Alert } from "antd";

// eslint-disable-next-line react-refresh/only-export-components
export const api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:3000`,
  timeout: 10000,
});

const ApiWrapper = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState("error");
  const [messageType, setMessageType] = useState("error");

  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  const handleClose = () => {
    setMessage(null);
    clearTimeout(timer);
  };

  let timer;

  const showMessageForFiveSeconds = () => {
    timer = setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["access-token"] = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      setType("success");
      setMessageType("Success!");
      if (response.data.message) {
        setMessage(response.data.message);
        showMessageForFiveSeconds();
      }
      return response;
    },
    (error) => {
      if (error.response) {
        setType("error");
        setMessageType("Error!");
        if (error.response.status === 440) {
          localStorage.removeItem("token");
          redirectToLogin();
        } else {
          setMessage(error.response.data.message || "An error occurred");
          showMessageForFiveSeconds();
        }
      } else {
        setMessage("Network Error: Please try again later");
        showMessageForFiveSeconds();
      }
      return Promise.reject(error);
    }
  );

  return (
    <>
      {message && (
        <Alert
          message={messageType}
          description={message}
          type={type}
          showIcon
          closable
          onClose={handleClose}
          style={{
            position: "fixed",
            top: "50px",
            left: "50%",
            transform: "translate(-50%, -30%)",
            width: "fit-content",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: "100000",
          }}
        />
      )}
      {children}
    </>
  );
};

export default ApiWrapper;
