import express from "express";
import multer from 'multer';
import { createItem,getItem,deleteItem } from "../controllers/itemController.js";


const itemRouter = express.Router()


// type here multer function to store Image

const storage = multer.diskStorage({
    destination :(_req,__file,cb) => cb(null,'uploads/'),
    filename:(_req,__file,cb) => cb(null, `${Date.now()} -${__file.originalname}`),
    
})
const upload = multer({storage});

itemRouter.post('/',upload.single('image'),createItem);
itemRouter.get('/',getItem);
itemRouter.delete('/:id',deleteItem);


export default itemRouter;
