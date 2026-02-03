const Student = require('../models/Student.model');



const getAllStudents = async (req,res) => {
    const page = parseInt(req.query.page) || 1;     // parseInt turns str -> int. Req query will contain what page or default to 1
    const limit = parseInt(req.query.limit) || 36;  // how many per page, default 36
    const skip = (page-1) * limit;                  // how many students to skip based on page and limit
    
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {

        // could put filter object here later from req
        const filter = { createdBy: req.user.id };
        const [students, totalCount] = await Promise.all([
            Student.find(filter).sort({ lastName: 1})
            .skip(skip)
            .limit(limit),
            Student.countDocuments(filter)  
        ])

        const totalPages = Math.ceil(totalCount / limit);                   // how many pages
        const hasNextPage = page < totalPages;                              // booleans say if we display buttons or not
        const hasPrevPage = page > 1;

        console.log('req.user:', req.user);
        console.log('req.user._id:', req.user.id);
        console.log('Filter:', filter);

        res.status(200).json({
            students: students,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount,
                limit: limit,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage
            }
        })
    } catch (error) {
        console.error('Database retrieval error:',error.message);
        res.status(500).json({ error: 'Failed to retrieve students.', detail: error.message });
    }
}


module.exports = {
    getAllStudents
}