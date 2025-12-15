import { Request, Response } from "express";
import Brand from "../models/Brand";


const createBrand = async (req: Request, res: Response) => {
    try {
        const { name, logoUrl, isActive } = req.body;

        const slug = name.toLowerCase().replace(/\s+/g, "-");

        const existingBrand = await Brand.findOne({ $or: [ { name }, { slug }]});
        if (existingBrand) {
            return res.status(400).json({ message: "Brand with this name or slug already exists."});
        }

        await Brand.create({
            name,
            slug,
            logoUrl,
            isActive
        })

        res.status(201).json({ message: "Brand created successfully." });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later."});
    }
}

const getAllBrands = async (req: Request, res: Response) => {
    try {
        const brands = await Brand.find({ isActive: true }).sort({ createdAt : -1 });
        res.status(200).json({ data: brands });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later."})   
    }
}

const getBrandBySlug = async (req: Request, res: Response) => {
    try {    
        const { slug } = req.params;
        const brand = await Brand.findOne({ slug });
        
        if(!brand) {
            return res.status(404).json({ message: "Brand not found." });
        } else if(!brand.isActive) {
            res.status(403).json({ message : "This brand is inactive."});
        }
        
        return res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." })
    }
}

const updateBrand = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found." });
        }

        const { name, logoUrl, isActive } = req.body;

        if(name && name !== brand.name) {
            const slug = name.toLowerCase().replace(/\s+/g, "-");

            const existingBrand = await Brand.findOne({ $or: [ { name }, { slug }], _id: { $ne: brand._id } });

            if (existingBrand) {
                return res.status(400).json({ message: "Another brand with this name or slug already exists."});
            }
            brand.name = name;
            brand.slug = slug;
        }

        if(brand.logoUrl !== undefined) return brand.logoUrl = logoUrl;
        if(isActive !== undefined) return brand.isActive = isActive;

        await brand.save();

        res.status(200).json({ message: "Brand updated successfully." });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later."});
    }
}

const deleteBrandById = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if(!brand) {
            return res.status(404).json({ message : "Brand not found." });
        }

        res.status(200).json({ message: "Brand deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later."});
    }
}

export { createBrand, getAllBrands, getBrandBySlug, updateBrand, deleteBrandById };
