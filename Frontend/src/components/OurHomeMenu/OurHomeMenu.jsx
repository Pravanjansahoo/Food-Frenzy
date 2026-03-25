import React, { useEffect, useState } from "react";
import { useCart } from "../../CartContext/CartContext";
import { dummyMenuData } from "../../assets/OmhDD";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./OurHomeMenu.css";
import axios from "axios";

const defaultCategories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Mexican",
  "Italian",
  "Drinks",
];

const mergeMenuData = (base, incoming) => {
  const merged = { ...base };
  Object.entries(incoming).forEach(([category, items]) => {
    merged[category] = [...(merged[category] || []), ...items];
  });
  return merged;
};

const OurHomeMenu = () => {
  const [categories, setCategories] = useState(defaultCategories);
  const [activeCategory, setActiveCategory] = useState(defaultCategories[0]);
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
  const [menuData, setMenuData] = useState(dummyMenuData);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/items")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        const grouped = items.reduce((acc, item) => {
          const category = item.category || "Other";
          acc[category] = acc[category] || [];
          acc[category].push(item);
          return acc;
        }, {});

        const mergedData = mergeMenuData(grouped, dummyMenuData);
        setMenuData(mergedData);

        const mergedCategories = Array.from(
          new Set([...defaultCategories, ...Object.keys(mergedData), "Other"])
        );
        setCategories(mergedCategories);
        if (mergedCategories.length > 0) {
          setActiveCategory((prev) =>
            mergedCategories.includes(prev) ? prev : mergedCategories[0]
          );
        }
      })
      .catch((err) => {
        console.error(err);
        const mergedCategories = Array.from(
          new Set([
            ...defaultCategories,
            ...Object.keys(dummyMenuData),
            "Other",
          ])
        );
        setCategories(mergedCategories);
      });
  }, []);

  // use the id to find and update

  const getCartEntry = (id) => cartItems.find((ci) => ci.id === id);
  const getQuantity = (id) => getCartEntry(id)?.quantity || 0;
  const displayItems = (menuData[activeCategory] || []).slice(0, 4);

  return (
    <div className="bg-linear-to-br from-[#1a120b] to-[#2a1e14] min-h-screen  py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-clip-text mb-12 bg-linear-to-r text-transparent  from-amber-200 via-amber-300 to-[#feb47b]">
          <span className="font-dancing-script block text-5xl md:text-7xl sm:text-6xl mb-2">
            Our Exquisite Menu
          </span>
          <span className="block text-xl sm:text-2xl md:text-3xl text-amber-100/60 mt-4 font-cinzel">
            A Symphony of Flavors, Crafted with Passion
          </span>
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-16 ">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-6 py-2 bg-linear-to-r  border-2 rounded-full transform text-sm font-cinzel sm:text-lg tracking-widest backdrop-blur-sm transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-linear-to-r from-amber-900/80 to-amber-700/80 border-amber-800 scale-105 shadow-xl shadow-amber-900/30"
                  : "bg-amber-900/20 border-amber-800/30 text-amber-100/80 hover:bg-amber-800/40 hover:border-amber-800/40 hover:scale-95"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayItems.map((item, i) => {
            const itemId = item._id ?? item.id;
            const cartEntry = getCartEntry(itemId);
            const quantity = getQuantity(itemId);
            return (
              <div
                key={itemId}
                className="relative bg-amber-900/20 rounded-2xl overflow-hidden border border-amber-800/30 backdrop-blur-sm flex-col flex transition-all duration-500 "
                style={{ "--index": i }}
              >
                <div
                  className="relative h-48 sm:h-56 md:h-60
                  flex items-center justify-center bg-black/10"
                >
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain transform hover:scale-105 transition-all duration-700"
                  />
                </div>
                <div className="p-4 sm:p-6 flex flex-col grow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-linear-to-r from-transition via-amber-800/50 opacity-50 transition-all duration-100" />
                  <h3 className="text-xl sm:text-2xl font-dancingscript text-amber-100 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-amber-100/80 mt-2 text-xs sm:text-sm mb-4 font-cinzel leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="bg-amber-100/10 backdrop-blur-sm px-3 py-1 rounded-2xl shadow-lg">
                      <span className="text-2xl font-bold text-amber-300 font-dancingscript">
                        ₹{item.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {quantity > 0 ? (
                        <>
                          <button
                            className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center hover:bg-amber-800/50 transition-colors"
                            onClick={() =>
                              quantity > 1
                                ? updateQuantity(cartEntry, quantity - 1)
                                : removeFromCart(itemId)
                            }
                          >
                            <FaMinus className="text-amber-100" />
                          </button>

                          <span className="w-8 text-center text-amber-100">
                            {quantity}
                          </span>

                          <button
                            className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center hover:bg-amber-800/50 transition-colors"
                            onClick={() => updateQuantity(itemId, quantity + 1)}
                          >
                            <FaPlus className="text-amber-100" />
                          </button>
                        </>
                      ) : (
                        <button
                          className="bg-amber-900/40 px-4 py-1.5 rounded-full font-cinzel text-xs tracking-wider transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-amber-900/20 relative border overflow-hidden border-amber-800/50"
                          onClick={() => addToCart(item, 1)}
                        >
                          <span className="relative z-10 text-xs text-black">
                            Add to Cart
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-16 ">
          <Link
            className="bg-amber-900/30 px-8 sm:px-10 py-3 rounded-full font-cinzel uppercase tracking-widest transition-all duration-300 hover:bg-amber-800/40 hover:text-amber-50 hover:scale-105 hover:shadow-lg hover:shadow-amber-900/20 backdrop-blur-sm border-amber-800/30"
            to="/Menu"
          >
            <span className="relative z-10 text-xs sm:text-sm text-black">
              Explore Full Menu
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OurHomeMenu;
