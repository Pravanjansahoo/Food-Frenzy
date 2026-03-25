import React, { useEffect, useState } from "react";
import { useCart } from "../../CartContext/CartContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const verifyPaymentPage = () => {
  const { clearCart } = useCart();
  const { search } = useLocation();
  const navigate = useNavigate();

  const { statusMsg, setStatusMsg } = useState("Verifying Payment....");

  //GRAB TOKEN
  const token = localStorage.getItem("authToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const params = new URLSearchParams(search);
    const success = params.get("success");
    const session_id = params.get("session_id");

    // MISSING OR CANCEL
    if (success !== "true" || !session_id) {
      if (success === "false") {
        navigate("/checkout", { replace: true });
        return;
      }
      setStatusMsg("Paymenr Faileed but Order placed for  completation");
      return;
    }

    // STROPE SUCCESS TRUE

    axios
      .get("http://localhost:4000/api/orders/confirm", {
        params: { session_id },
        headers: authHeaders,
      })
      .then(() => {
        clearCart();
        navigate("/myorder", { replace: true });
      })
      .catch((err) => {
        console.error(" confirmation error", err);
        setStatusMsg("There was an error");
        clearCart(false);
      });
  }, [search, clearCart, navigate, authHeaders]);
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>{statusMsg}</p>
    </div>
  );
};

export default verifyPaymentPage;
