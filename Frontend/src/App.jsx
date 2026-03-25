import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home/Home";
import ContactPage from "./Pages/ContactPage/ContactPage";
import AboutPage from "./Pages/AboutPage/AboutPage";
import Menu from "./Pages/Menu/Menu";
import Cart from "./Pages/Cart/Cart";
import SignUp from "./components/SignUp/SignUp";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import VerifyPaymentPage from "./Pages/verifyPaymentPage/verifyPaymentPage";
import CheckoutPage from "./Pages/CheckoutPage/CheckoutPage";
import MyOrderPage from "./Pages/MyOrderPage/MyOrderPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/menu" element={<Menu />} />

      <Route path="/login" element={<Home />} />
      <Route path="/Signup" element={<SignUp />} />

      {/* payment verification */}
      <Route path="/myorder/verify" element={<VerifyPaymentPage />} />

      <Route
        path="/cart"
        element={       
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route path="/checkout" element={
        <PrivateRoute>
          <CheckoutPage/>
        </PrivateRoute>
        }/>
        <Route path="/myorder" element ={
          <PrivateRoute>
            <MyOrderPage/>
          </PrivateRoute>
        }/>
    </Routes>
  );
};

export default App;
