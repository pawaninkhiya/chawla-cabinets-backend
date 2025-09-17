interface PaginationOptions {
    page?: string | number;
    limit?: string | number;
}

interface PaginationResult {
    skip: number;
    limit: number;
    page: number;
    totalPages: number;
    total: number;
}

export const paginate = (totalItems: number, options: PaginationOptions = {}): PaginationResult => {
    const page = Math.max(1, parseInt(options.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit as string, 10) || 10);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    return {
        skip,
        limit,
        page,
        totalPages,
        total: totalItems,
    };
};
