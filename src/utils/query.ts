export const buildSearchQuery = (search?: string, fields: string[] = []) => {
    if (!search || fields.length === 0) return {};
    
    // Build a case-insensitive regex query for multiple fields
    const regex = { $regex: search, $options: "i" };
    const orQuery = fields.map(field => ({ [field]: regex }));
    
    return { $or: orQuery };
};
