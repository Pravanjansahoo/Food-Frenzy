import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import axios from "axios";
const CartContext = createContext();

const isObjectId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const normalizeCartItem = (cartItem) => {
  const item = cartItem?.item || {};
  const itemId = item?._id || cartItem?.itemId || cartItem?.id;
  return {
    _id: cartItem?._id,
    id: itemId,
    item,
    quantity: cartItem?.quantity ?? 0,
    name: item?.name ?? cartItem?.name,
    price: item?.price ?? cartItem?.price,
    image: item?.imageUrl ?? item?.image ?? cartItem?.image,
    description: item?.description ?? cartItem?.description,
  };
};

/**
 * Frontend-only CartItem shape (do not import backend models here).
 * @typedef {Object} CartProduct
 * @property {string} _id
 * @property {number} price
 * @property {string} [name]
 *
 * @typedef {Object} CartItem
 * @property {string} _id
 * @property {CartProduct} item
 * @property {number} quantity
 */

//REDUCER  HANDLING CART ACTIONS (ADD, REMOVE, UPDATE QUANTITY) CAN BE IMPLEMENTED HERE

/**
 * @param {CartItem[]} state
 * @param {{ type: string, payload: any }} action
 * @returns {CartItem[]}
 */
const cartReducer = (state, action) => {
  switch (action.type) {
    case "HYDRATE_CART":
      return action.payload;
    case "ADD_ITEM": {
      const { id, quantity } = action.payload;
      const exists = state.find((ci) => ci.id === id);
      if (exists) {
        return state.map((ci) =>
          ci.id === id ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      }
      return [...state, action.payload];
    }
    case "REMOVE_ITEM": {
      return state.filter((ci) => ci.id !== action.payload);
    }
    case "UPDATE_ITEM": {
      const { id, quantity } = action.payload;
      return state.map((ci) => (ci.id === id ? { ...ci, quantity } : ci));
    }
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};

//INITALISE CART FROM  LOCALSTORAGE

/** @returns {CartItem[]} */
const initializer = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(stored) ? stored.map(normalizeCartItem) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(
    cartReducer,
    /** @type {CartItem[]} */ ([]),
    initializer
  );

  //PERSIST CART STATE TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  //  HYDRATE FROM SERVER API
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios
      .get("https://food-frenzy-backend.onrender.com/api/cart", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        dispatch({
          type: "HYDRATE_CART",
          payload: Array.isArray(res.data)
            ? res.data.map(normalizeCartItem)
            : [],
        })
      )
      .catch((err) => {
        if (err.response?.status !== 401) console.error(err);
      });
  }, []);
  // //CALCULATE TOTAL COST AND TOTAL ITEM COUNT
  // const cartTotal = cartItems.reduce(
  //   (total, item) => total + item.price * item.quantity,
  //   0
  // );
  // const totalItemsCount = cartItems.reduce(
  //   (sum, item) => sum + item.quantity,
  //   0
  // );

  // //format total items in power form
  // const formatTotalItems = (num) => {
  //   if (num >= 1000) {
  //     return (num / 1000).toFixed(1) + "k";
  //   }
  //   return num;
  // };
  // DISPATCHER WRAPPED WITH USE CALLBACK FOR PERFORMANCE
  /**
   * @param {CartProduct} item
   * @param {number} qty
   */
  const addToCart = useCallback(async (item, qty) => {
    const token = localStorage.getItem("authToken");
    const itemId = item?._id ?? item?.id;
    const quantity = Number(qty);

    if (!itemId || !Number.isFinite(quantity)) {
      throw new Error("itemId and quantity are required");
    }

    if (!isObjectId(itemId) || !token) {
      dispatch({
        type: "ADD_ITEM",
        payload: normalizeCartItem({
          _id: `local-${itemId}`,
          id: itemId,
          item,
          quantity,
          name: item?.name ?? item?.title,
          price: Number(item?.price) || item?.price,
          image: item?.image ?? item?.imageUrl,
          description: item?.description,
        }),
      });
      return;
    }

    const res = await axios.post(
      "https://food-frenzy-backend.onrender.com/api/cart",
      { itemId, quantity },
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch({ type: "ADD_ITEM", payload: normalizeCartItem(res.data) });
  }, []);
  /** @param {string} _id */
  const removeFromCart = useCallback(
    async (_id) => {
      const entry =
        cartItems.find((ci) => ci.id === _id) ||
        cartItems.find((ci) => ci._id === _id);
      if (!entry) return;

      if (!isObjectId(entry._id)) {
        dispatch({ type: "REMOVE_ITEM", payload: entry.id });
        return;
      }

      const token = localStorage.getItem("authToken");
      await axios.delete(
        `https://food-frenzy-backend.onrender.com/api/cart/${entry._id}`,

        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({ type: "REMOVE_ITEM", payload: entry.id });
    },
    [cartItems]
  );

  /**
   * @param {string} _id
   * @param {number} qty
   */
  const updateQuantity = useCallback(
    async (_id, qty) => {
      const entry =
        cartItems.find((ci) => ci.id === _id) ||
        cartItems.find((ci) => ci._id === _id);
      if (!entry) return;

      if (!isObjectId(entry._id)) {
        dispatch({
          type: "UPDATE_ITEM",
          payload: { id: entry.id, quantity: Number(qty) },
        });
        return;
      }

      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `https://food-frenzy-backend.onrender.com/api/cart/${entry._id}`,
        { quantity: qty },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({ type: "UPDATE_ITEM", payload: normalizeCartItem(res.data) });
    },
    [cartItems]
  );

  const clearCart = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    await axios.post(
      "https://food-frenzy-backend.onrender.com/api/cart/clear",
      {},
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalAmount = cartItems.reduce((sum, ci) => {
    const price = ci?.item?.price ?? ci?.price ?? 0;
    const qty = ci?.quantity ?? 0;
    return sum + price * qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
