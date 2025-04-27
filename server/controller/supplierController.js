import Supplier from "../models/Supplier.js";

// ✅ Get all suppliers
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({}, "_id name email contact address"); // Fetch only id & name
        res.json(suppliers);
      } catch (error) {
        res.status(500).json({ message: "Error fetching suppliers", error });
      }
};

// ✅ Add a new supplier
export const addSupplier = async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;

    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: "Supplier with this email already exists" });
    }

    const newSupplier = new Supplier({ name, contact, email, address });
    await newSupplier.save();
    
    res.status(201).json({ message: "Supplier added successfully", supplier: newSupplier });
  } catch (error) {
    res.status(500).json({ message: "Error adding supplier", error });
  }
};

// ✅ Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, address } = req.body;

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { name, contact, email, address },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier updated successfully", supplier: updatedSupplier });
  } catch (error) {
    res.status(500).json({ message: "Error updating supplier", error });
  }
};

// ✅ Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting supplier", error });
  }
};
