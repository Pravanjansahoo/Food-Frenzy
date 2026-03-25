import itemModal from "../modals/itemModal.js";

export const createItem = async (req, res, next) => {
  try {
    const { name, description, category, price, rating, hearts } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const total = Number(price) * 1;
    const newItem = new itemModal({
      name,
      description,
      category,
      price,
      rating,
      heart: Number(hearts ?? 0),
      imageUrl,
      total,
    });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "item alreadyy exists" });
    } else {
      next(err);
    }
  }
};

//get function to gett all function

export const getItem = async (req, res, next) => {
  try {
    const item = await itemModal.find().sort({ createdAt: -1 });
    const host = `${req.protocol}://${req.get("host")}`;

    const withFullUrl = item.map((i) => ({
      ...i.toObject(),
      imageUrl: i.imageUrl ? `${host}${i.imageUrl}` : "",
      hearts: i.heart ?? i.hearts ?? 0,
    }));
    res.json(withFullUrl);
  } catch (err) {
    next(err);
  }
};

//Delete function to delete Items

export const deleteItem = async (req, res, next) => {
  try {
    const removed = await itemModal.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Item not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
