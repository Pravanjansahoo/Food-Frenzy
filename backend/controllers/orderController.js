import Stripe from "stripe";
import Order from "../modals/orderModal.js";

// dotenv is loaded in server.js (root) to avoid duplicate type imports
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create aorder function

export const createOrder = async (req, res) => {
  try {
    const {
      // Accept both camelCase (client) and lowercase (schema) field names
      firstName,
      lastName,
      zipCode,
      firstname,
      lastname,
      zipcode,
      phone,
      email,
      address,
      city,
      paymentMethod,
      subtotal,
      tax,
      total,
      items,
    } = req.body;

    const normalizedFirstName = firstname ?? firstName;
    const normalizedLastName = lastname ?? lastName;
    const normalizedZipCode = zipcode ?? zipCode;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid or empty items array" });
    }

    const orderItems = items.map(
      ({ item, name, price, imageUrl, quantity }) => {
        const base = item || {};
        return {
          item: {
            name: base.name || name || "Unknown",
            price: Number(base.price ?? price) || 0,
            imageUrl: base.imageUrl || base.image || imageUrl || "",
          },
          quantity: Number(quantity) || 0,
        };
      }
    );

    //  DEFULT SHIPPING COST
    const shippingCost = 0;
    let newOrder;

    if (paymentMethod === "online") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",

        line_items: orderItems.map((o) => ({
          price_data: {
            currency: "inr",
            product_data: { name: o.item.name },
            unit_amount: Math.round(o.item.price * 100),
          },
          quantity: o.quantity,
        })),
        customer_email: email,
        success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
        metadata: {
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          email,
          phone,
        },
      });
      newOrder = new Order({
        user: req.user._id,
        firstname: normalizedFirstName,
        lastname: normalizedLastName,
        phone,
        email,
        address,
        city,
        zipcode: normalizedZipCode,
        paymentMethod,
        subtotal,
        tax,
        total,
        items,
        shipping: shippingCost,
        items: orderItems,
        paymentIntentId: session.payment_intent,
        sessionId: session.id,
        paymentStatus: "pending",
      });

      await newOrder.save();
      return res
        .status(201)
        .json({ order: newOrder, checkoutUrl: session.url });
    }

    // if payment is done COD

    newOrder = new Order({
      user: req.user._id,
      firstname: normalizedFirstName,
      lastname: normalizedLastName,
      phone,
      email,
      address,
      city,
      zipcode: normalizedZipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      items,
      shipping: shippingCost,
      items: orderItems,
      paymentStatus: "succeeded",
    });
    await newOrder.save();
    return res.status(201).json({ order: newOrder, checkoutUrl: null });
  } catch (error) {
    console.error("CreateOrder Error ", error);
    res.status(500).json({ message: "server Error", error: error.message });
  }
};

// confirm payment 

export const confirmPayment = async (req, res )=>{
  try {
    const {session_id} = req.query
    if (!session_id) return res.status(400).json({message:"session_id required"});

    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status === 'paid') {
      const order = await Order.findOneAndUpdate(
        {sessionId:session_id},
        {paymentStatus : "successed"},
        {new:true}
      );
      if(!order) return res.status(404).json({message:"Order not found"})
        return res.json(order)
    }
    return res.status(400).json({message:"payment not completed"})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server Error", error: err.message });
  }
}

// get order

export const getOrders = async (req,res) =>{
   try {
     const filter = { user: req.user._id }; //order is belong to that perticular user
     const rawOrders = await Order.find(filter).sort({ createdAt: -1 }).lean();

     // FORMAT
     const formatted = rawOrders.map((o) => ({
       ...o,
       items: o.items.map((i) => ({
         _id: i._id,
         item: i.item,
         quantity: i.quantity,
       })),
       createdAt: o.createdAt,
       paymentStatus: o.paymentStatus,
     }));
     res.json(formatted);
   } catch (error) {
     console.error("getOrders Error ", error);
     res.status(500).json({ message: "server Error", error: error.message });
   }
}


//ADMIN ROUTE GET ALL ORDER

export const getAllOrders = async (req,res) =>{
  try {

    const raw = await Order
    .find ({})
    .sort({createdAt:-1})
    .lean()

    const formatted = raw.map((o) => ({
      _id: o._id,
      user: o.user,
      firstName: o.firstname ?? o.firstName,
      lastName: o.lastname ?? o.lastName,
      phone: o.phone,
      email: o.email,
      address: o.address ?? o.shippingAddress?.address ?? "",
      city: o.city ?? o.shippingAddress?.city ?? "",
      zipCode: o.zipcode ?? o.zipCode ?? o.shippingAddress?.zipCode ?? "",

      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i._id,
        item: i.item,
        quantity: i.quantity,
      })),
    }));
    res.json(formatted)
    
  } catch (error) {
       console.error("getAllOrders Error ", error);
       res.status(500).json({ message: "server Error", error: error.message });
  }
}


// UPDATE ORDER WITHOUT TOKEN FOR ADMIN

export const updateAnyOrder = async (req,res) =>{
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true,runValidators:true}
    );
    if (!updated) {
      return res.status(404).json({message:"Order Not Found"})
    }
    res.json(updated)
  }  catch (error) {
       console.error("updateAnyOrder Error ", error);
       res.status(500).json({ message: "server Error", error: error.message });
  }
}

// GET ORDER BY ID
export const getOrderById = async (req,res) =>{
  try {
    const order = await Order.findById(req.params.id);
     if (!order) 
       return res.status(404).json({ message: "Order Not Found" });
     
     if (!order.user.equals(req.user._id)) {
       return res.status(403).json({ message: "Access denied" });
     }
     if (req.query.email && order.email !== req.query.email) {
       return res.status(403).json({ message: "Access denied" });
     }
    res.json(order)

  } catch (error) {
      console.error("getOrderById Error ", error);
      res.status(500).json({ message: "server Error", error: error.message });
  }
}

// update by id

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order Not Found" });

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (req.body.email && order.email !== req.body.email) {
      return res.status(403).json({ message: "Access denied" });
    }
    const updated = await Order.findByIdAndUpdate (req.params.id,req.body,{new:true});
    res.json(updated);
  } catch (error) {
    console.error("updateOrder Error ", error);
    res.status(500).json({ message: "server Error", error: error.message });
  }
};
