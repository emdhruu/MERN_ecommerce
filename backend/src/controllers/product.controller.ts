import { Request, Response } from "express";
import Categories from "../models/Categories";
import Brand from "../models/Brand";
import Product from "../models/Product";

const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            price,
            salesPrice,
            discountPercentage,
            category,
            brand,
            inStock,
            images,
            thumbnail,
            stock,
            isFeatured,
            isDeleted
        } = req.body;

        const categoryExits = await Categories.findById(category);
        const brandExits = await Brand.findById(brand);
        const priceValue = parseFloat(price);

        if(!name || !description || !price || !category || !brand || !images?.length || !stock) {
            return res.status(400).json({ message : "All required fields must be filled." })
        } else if (!categoryExits) {
            return res.status(404).json({ message : "Category not found." });
        } else if (!brandExits) {
            return res.status(404).json({ message : "Brand not found." });
        } else if (isNaN(priceValue) || priceValue <= 0){
            return res.status(400).json({ message : "Price must be a valid number greater than zero." });
        } else if (discountPercentage && (!salesPrice || salesPrice >= priceValue)) {
            return res.status(400).json({ message : "Invalid discount logic. Sales Price must be less than the original price." });
        } 

        if (thumbnail && !images.includes(thumbnail)) {
            return res.status(400).json({ message : "Thumbnail must be one of the images." });
        } else {
            req.body.thumbnail = images[0];
        }

        const product = await Product.create({
            name,
            description,
            price: priceValue,
            salesPrice: salesPrice ? parseFloat(salesPrice) : null,
            discountPercentage: discountPercentage || 0,
            category,
            brand,
            inStock:
            images,
            thumbnail,
            stock,
            isFeatured: isFeatured || false,
            isDeleted: isDeleted || false
        })

        return res.status(201).json({ message : "Product created successfully.", data: product });
    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const getAllProducts = async (req: Request, res: Response) => {
    try {
        const filter : any = { isDeleted: false };
        const sort : any = {};
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        //filter by category
        if (req.query.category) {
            filter.category = { $in: req.query.category };
        }
        //filter by brand
        if (req.query.brand) {
            filter.brand = { $in: req.query.brand };
        }
        //search filter (optional)
        if (req.query.search ) {
            const searchTerm = req.query.search.toString();
            filter.name = { $regex: searchTerm, $options: "i" }; //case insensitive
        } 

        //sorting
        if(req.query.sort) {
            const sortField = req.query.sort.toString();
            const sortOrder = req.query.order === "desc" ? -1 : 1;
            sort[sortField] = sortOrder;
        }

        //Total products count for pagination
        const total = await Product.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const products = await Product.find(filter)
            .populate("category")
            .populate("brand")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.set("X-Total-Count", total.toString());
        res.set("X-Total-Pages", totalPages.toString());
        res.set("X-Current-Page", page.toString());

        return res.status(200).json({ page, limit, data: products  });

    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const getProductById = async (req : Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findById({ _id : id, isDeleted: false }).populate("category").populate("brand");

        if (!product) {
            return res.status(404).json({ message : "Product not found." });
        }

        return res.status(200).json({ data: product });
    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const updateProductById = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const updateData = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message : "Product not found." });
        }

        if ( updateData.isDeleted ){
            return res.status(400).json({ message : "Can't update deleted product. Restore it first." });
        }

        if ( updateData.price && updateData.price <= 0 ){
            return res.status(400).json({ message : "Price must be a valid number greater than zero." });
        }

        if ( updateData.discountPercentage || updateData.salesPrice ) {
            if (updateData.discountPercentage < 0 || updateData.discountPercentage > 100){
                return res.status(400).json({ message : "Discount percent must be between 0 & 100." });
            } else if ( updateData.salesPrice && updateData.salesPrice >= (updateData.price || product.price) ) {
                return res.status(400).json({ message : "Invalid discount logic. Sales Price must be less than the oiginal price." });
            }
        }

        if ( updateData.images.length <= 0 ){
            return res.status(400).json({ message : "At least one product image is required." });
        }
        if ( !updateData.thumbnail ) {
            updateData.thumbnail = updateData.images ? updateData.images[0] : product.images[0];
        } else if ( updateData.images && !updateData.images.includes(updateData.thumbnail) ) {
            return res.status(400).json({ message : "Thumbnail must be one of the images." });
        }

        if ( updateData.stock && updateData.stock < 0 ){
            updateData.inStock = false;
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true , runValidators: true });

        return res.status(200).json({ message : "Product updated successfully.", data: updatedProduct });


    } catch (error) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const deleteProductById = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        
        const product = await Product.findByIdAndUpdate(productId, { isDeleted: true }, { new: true });
        if (!product) {
            return res.status(404).json({ message : "Product not found." });
        }

        return res.status(200).json({ message : "Product deleted successfully." });
    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const getFeaturedProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({ isFeatured: true, isDeleted: false });

        if (products.length === 0) {
            return res.status(404).json({ message : "No featured products found." });
        }

        return res.status(200).json({ data: products });
    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const updateProductStockById = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const { stock } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message : "Product not found." });
        }

        product.stock = stock;
        product.inStock = stock > 0;

        await product.save();

        return res.status(200).json({ message : "Product stock updated successfully.", data: product });
    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

const updateFeaturedStatusById = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const { isFeatured } = req.body;
        
        const product = await Product.findById(productId);
        if (!product){
            return res.status(404).json({ message : "Product not found." });
        }

        product.isFeatured = isFeatured;
        await product.save();

        return res.status(200).json({ message : "Product featured status updated successfully.", data: product });
    } catch (error: any) {
        res.status(500).json({ message : "Server error, Please try again later." });
    }
}

export { createProduct, getAllProducts, getProductById , updateProductById, deleteProductById, getFeaturedProducts, updateProductStockById, updateFeaturedStatusById };