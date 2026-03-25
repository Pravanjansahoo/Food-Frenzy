import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../CartContext/CartContext";
import { FaPlus, FaMinus, FaTrash, FaTimes } from "react-icons/fa";

const API_URL = "https://food-frenzy-backend.onrender.com/";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(null);


  //FOR Image Url
  const buildImageUrl = (path) => {
    if (!path) return "";
    if (/^(https?:)?\/\//i.test(path)) return path;
    if (/^(data:|blob:)/i.test(path)) return path;
    if (path.startsWith("/uploads/")) {
      const base = API_URL.replace(/\/$/, "");
      return `${base}${path}`;
    }
    if (path.startsWith("/")) return path;
    const base = API_URL.replace(/\/$/, "");
    return `${base}/uploads/${path.replace(/^\/+/, "")}`;
  };


  const parsePrice = (value) => {
    if (typeof value === "number") return value;
    const cleaned = String(value).replace(/[^\d.]/g, "");
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen overflow-x-hidden py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-12 animate-fade-in-down">
          <span className="font-dancing-script block text-5xl sm:text-6xl md:text-7xl mb-2 bg-linear-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            {cartItems.length === 0 ? "Your Cart is Empty!" : "Your Cart"}
          </span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center animate-fade-in">
            <p className="text-amber-100/80 text-xl mb-4">Your cart is empty</p>
            <Link
              to="/menu"
              className="transition-all duration-300 inline-flex text-amber-100 text-sm font-cinzel items-center gap-2 hover:gap-3 hover:bg-amber-800/50 bg-amber-900/40 px-6 py-3 rounded-full uppercase"
            >
              Browse All Items
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cartItems.map((item) => {
                const itemId = item.id ?? item._id;
                const quantity = item.quantity ?? 0;
                const itemPrice = parsePrice(item.price);
                const itemTotal = itemPrice * quantity;
                const rawImage =
                  item.image ||
                  item.imageUrl ||
                  item.item?.imageUrl ||
                  item.item?.image;

                return (
                  <div
                    key={itemId}
                    className="group bg-amber-900/20 rounded-2xl border-4 border-dashed border-amber-500 p-4 backdrop-blur-sm flex flex-col items-center gap-4 transition-all duration-300 hover:border-solid hover:shadow-xl hover:shadow-amber-900/10 transform hover:-translate-y-1 animate-fade-in-up"
                  >
                    <div
                      className="w-24 h-24 shrink-0 cursor-pointer relative rounded-lg overflow-hidden transition-transform duration-300"
                        onClick={() =>
                          setSelectedImage(buildImageUrl(rawImage))
                        }
                      >
                        <img
                          src={buildImageUrl(rawImage)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="w-full text-center">
                      <h3 className="text-xl font-dancing-script text-amber-100/80">
                        {item.name}
                      </h3>
                      <p className="text-amber-100/80 text-sm mb-2">
                        Price: ₹{Number(itemPrice).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(itemId, Math.max(1, quantity - 1))
                        }
                        className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center hover:bg-amber-800/50 transition-all duration-300 active:scale-95"
                      >
                        <FaMinus className="text-amber-100/80" />
                      </button>
                      <span className="w-8 text-center text-amber-100/80 font-cinzel">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(itemId, quantity + 1)}
                        className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center hover:bg-amber-800/50 transition-all duration-300 active:scale-95"
                      >
                        <FaPlus className="text-amber-100/80" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center w-full gap-3">
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-xs px-3 py-1 rounded-full font-cinzel flex uppercase duration-300 items-center gap-1 hover:bg-amber-800/50 bg-amber-900/40 transition-all active:scale-95"
                      >
                        <FaTrash className="w-4 h-4 text-amber-100" />
                        <span className="text-amber-100">Remove</span>
                      </button>
                      <p className="text-sm font-dancing-script text-amber-300">
                        ₹{Number(itemTotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 pt-8 border-amber-800/30 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <Link
                  to="/menu"
                  className=" bg-amber-900/40 px-8 py-3 rounded-full fon-cinzel uppercase tracking-wider hover:bg-amber-800/50 transition-all duration-300 text-amber-100 inline-flex items-center gap-2 hover:gap-3  active:scale-95"
                >
                  Continue Shopping
                </Link>
                <div className="flex items-center text-right gap-8">
                  <h2 className="text-3xl font-dancing-script text-amber-200">
                    Total: ₹{grandTotal.toFixed(2)}
                  </h2>
                  <Link to="/checkout" className="bg-amber-900/40 px-8 py-3 rounded-full fon-cinzel uppercase tracking-wider hover:bg-amber-800/50 transition-all duration-300 text-amber-100 inline-flex items-center gap-2 hover:gap-3  active:scale-95">
                    Checkout New
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-amber-900/50 bg-opacity-75 flex items-center backdrop-blur justify-center z-50 p-4 overflow-auto "
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={selectedImage}
              alt="Enlarged Item"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg object-contain"
            />
            <button
              className="absolute top-1 right-1 bg-amber-900/80 rounded-full p-2 text-black hover:bg-amber-800/90 transition-transform duration-200 active:scale-90"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
