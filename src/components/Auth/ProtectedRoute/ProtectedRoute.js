import { useAuth } from "../Provider/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({children}) => {
    const { token } = useAuth();
  
    if (!token) {
      return <Navigate to="/login" />;
    }

    debugger;
  
    return (<div>{children}</div>);
  };