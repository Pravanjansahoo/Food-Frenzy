// import asyncHandler from 'express-async-handler';
// import { CartItem } from "../modals/cartModal.js";


// //get cart 

// export const getCart = asyncHandler (async(req,res) =>{
//     const items = await CartItem.find({user:req.user._id}).populate('item');


//     const formatted = items.map(ci =>({
//         _id:ci._id.toString(),
//         item:ci.items,
//         quantity:ci.quantity
//     }))
//     res.json(formatted)
// })

// //ADD TO CART FUNCTION TO ADD OTEMS TO CART

// export const addToCart = asyncHandler(async(req,res)=> {
//     const {itemId,quantity} =req.body;
//     if(!itemId || typeof quantity !== 'number'){
//         res.status(400);
//         throw new Error("itemId  and quantity are requried")
//     }

//     let cartItem = await CartItem.findOne ({user: req.user._id,item:itemId})

//     if (cartItem) {
//         cartItem.quantity = Math.max(1,cartItem.quantity + quantity)

//         if (cartItem.quantity <1) {
//             await cartItem.remove();
//             return res.json({_id:cartItem._id.toString(),item:cartItem.item,quantity:0})
//         }
//         await cartItem.save();
//         await cartItem.populate('item');
//         return res.status(200).json({
//             _id:cartItem._id.toString(),
//             item:cartItem.item,
//             quantity:cartItem.quantity,
//         })
//     }

//     cartItem = await cartItem.create({
//         user:req.user_id,
//         item:itemId,
//         quantity,
//     })

//     await cartItem.populate('item');
//     res.status(201).json({
//       _id: cartItem._id.toString(),
//       item: cartItem.item,
//       quantity: cartItem.quantity,
//     });

// }) 

// //LETS CREATE A METHOD TO UPDATE

// export const updateCartItem = asyncHandler(async (req,res) =>{
//     const {quantity} = req.body;

//     const cartItem = await CartItem.findOne({_id:req.params.id,user:req.user._id})
//     if (!cartItem){ res.status(404);
//     throw new Error('Cart item not found')
//     }
    
//     cartItem.quantity = Math.max(1, quantity)
//     await cartItem.save(),
//     await cartItem.populate('item')
//     res.json({
//       _id: cartItem._id.toString(),
//       item: cartItem.item,
//       quantity: cartItem.quantity,
//     });
//     }
// )

// // delte function

// export const deleteCartItem = asyncHandler (async (req,res)=>{
//       const cartItem = await CartItem.findOne({
//         _id: req.params.id,
//         user: req.user._id,
//       });
//        if (!cartItem) {
//          res.status(404);
//          throw new Error("Cart item not found");
//        }
//     await cartItem.deleteOne();
//     res.json ({_id:req.params.id})
// }) 

// // clear cart functionn to empty the cart 
// export const clearCart = asyncHandler(async(req,res)=>{
//     await CartItem.deleteMany({user:req.user._id});
//     res.json({message:"cart Cleared"})
// }) 


import asyncHandler from "express-async-handler";
import { CartItem } from "../modals/cartModal.js"; // Named import - matches your export

const withFullImageUrl = (item, host) => {
  if (!item) return item;
  const obj = item.toObject ? item.toObject() : item;
  let imageUrl = obj.imageUrl || "";
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    imageUrl = `${host}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
  return { ...obj, imageUrl };
};

// GET CART
export const getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id }).populate("item");
  const host = `${req.protocol}://${req.get("host")}`;

  const formatted = items.map((ci) => ({
    _id: ci._id.toString(),
    item: withFullImageUrl(ci.item, host), // Fixed: was ci.items
    quantity: ci.quantity,
  }));
  res.json(formatted);
});

// ADD TO CART
export const addToCart = asyncHandler(async (req, res) => {
  // SAFE body parsing - fixes your 500 error
  if (!req.body) {
    res.status(400);
    throw new Error("Request body missing");
  }

  const { itemId, quantity = 1 } = req.body;
  if (!itemId || typeof quantity !== "number") {
    res.status(400);
    throw new Error("itemId and quantity (number) are required");
  }

  let cartItem = await CartItem.findOne({
    user: req.user._id, // Fixed: was req.user_id
    item: itemId,
  });

  if (cartItem) {
    cartItem.quantity = Math.max(1, cartItem.quantity + quantity);

    if (cartItem.quantity < 1) {
      await cartItem.deleteOne(); // Fixed: remove() deprecated
      const host = `${req.protocol}://${req.get("host")}`;
      return res.json({
        _id: cartItem._id.toString(),
        item: withFullImageUrl(cartItem.item, host),
        quantity: 0,
      });
    }

    await cartItem.save();
    await cartItem.populate("item");
    const host = `${req.protocol}://${req.get("host")}`;
    return res.status(200).json({
      _id: cartItem._id.toString(),
      item: withFullImageUrl(cartItem.item, host),
      quantity: cartItem.quantity,
    });
  }

  // Fixed: CartItem.create() not cartItem.create()
  cartItem = await CartItem.create({
    user: req.user._id,
    item: itemId,
    quantity,
  });

  await cartItem.populate("item");
  const host = `${req.protocol}://${req.get("host")}`;
  res.status(201).json({
    _id: cartItem._id.toString(),
    item: withFullImageUrl(cartItem.item, host),
    quantity: cartItem.quantity,
  });
});

// UPDATE CART ITEM
export const updateCartItem = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400);
    throw new Error("Request body missing");
  }

  const { quantity } = req.body;
  if (typeof quantity !== "number") {
    res.status(400);
    throw new Error("quantity must be a number");
  }

  const cartItem = await CartItem.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!cartItem) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  cartItem.quantity = Math.max(1, quantity);
  await cartItem.save();
  await cartItem.populate("item");
  const host = `${req.protocol}://${req.get("host")}`;
  res.json({
    _id: cartItem._id.toString(),
    item: withFullImageUrl(cartItem.item, host),
    quantity: cartItem.quantity,
  });
});

// DELETE CART ITEM
export const deleteCartItem = asyncHandler(async (req, res) => {
  const cartItem = await CartItem.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!cartItem) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  await cartItem.deleteOne();
  res.json({ _id: req.params.id });
});

// CLEAR CART
export const clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ message: "Cart cleared" });
});
