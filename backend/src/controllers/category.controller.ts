import { Request, Response } from "express";
import Categories from "../models/Categories";

const createCategory = async(req: Request, res: Response) => {
    try {
        const newCategory = req.body;

        const existingCategory = await Categories.findOne({ name : newCategory.name })

        if(existingCategory){
            return res.status(400).json({ message : "This category is already exists in list." });
        }

        new Categories({ newCategory })

        res.status(200).json({ message : "Category added successfully" });
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const updateCategory = async(req: Request, res: Response) => {
    try {
        const { id, name, slug, description, imageUrl, isActive } = req.body;
        
        const updateData : any= { description, imageUrl, isActive };

        if(name){
            updateData.name = name,
            updateData.slug = slug ? slug : name.toLowerCase().replace(/\s+/g, "-");
        }

        const categoryUpdated = await Categories.findByIdAndUpdate(id, updateData,{
            new: true,
            runValidators: true
        })

        if (!categoryUpdated) {
          return res.status(404).json({ message : "Category not found" });
        }

        res.status(200).json({ message : "Category details updated successfully.", data: updateCategory});
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." })
    }
}

const deleteCategory = async(req: Request, res: Response) => {
    try {
        const { id } = req.body;

        const deleteCat = await Categories.findByIdAndDelete( id )

        if (!deleteCat){
            return res.status(404).json({ message : "Category not found" });
        }

        res.status(200).json({ message : "Category deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const isActiveUpdate = async(req: Request, res: Response) => {
    try {
        const { id, isActive } = req.body;

        const updateStatus = await Categories.findByIdAndUpdate(id,
            {isActive: isActive},
            {new : true}
        )

        if (!updateStatus){
            return res.status(404).json({ message : "Catgory not found." });
        }

        res.status(200).json({ message : "Category disabled successfully.", data: updateStatus });
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const getAllCategory = async(req: Request, res: Response) => {
    try {
        const categories = await Categories.find().sort({ createdAt: -1 });
        if(!categories){
            res.status(404).json({ message: "This list is empty." });
        }
        res.status(200).json({data: categories})
    } catch (error) {
        res.status(200).json({ message : "Server Error, Please try again later." })
    }
}

const getCategoryById = async(req: Request, res: Response) => {
    try {
        const allCategories = await Categories.findById(req.body);
        if(!allCategories){
            res.status(404).json({ message: "No category found." })
        }
        res.status(200).json({ data : allCategories});
    } catch (error) {
        res.status(200).json({ message : "Server Error, Please try again later." });
    }
}

export { createCategory, updateCategory, deleteCategory, isActiveUpdate , getAllCategory, getCategoryById };