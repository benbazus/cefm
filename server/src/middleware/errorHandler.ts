

import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
    errors?: { [key: string]: string };
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error for debugging (consider using a proper logging library in production)
    console.error('Error:', err);

    // Set a default status code
    const statusCode = err.statusCode || 500;

    // Prepare the error response
    const errorResponse: { message: string; errors?: { [key: string]: string } } = {
        message: err.message || 'An unexpected error occurred',
    };

    // Add validation errors if available
    if (err.errors) {
        errorResponse.errors = err.errors;
    }

    // Handle specific error types
    switch (err.name) {
        case 'ValidationError':
            return res.status(400).json(errorResponse);
        case 'UnauthorizedError':
            // Redirect to login page for unauthorized errors
            return res.redirect('/login');
        default:
            // In production, don't send the stack trace
            if (process.env.NODE_ENV === 'production') {
                delete errorResponse.errors;
                errorResponse.message = 'Internal server error';
            }
            return res.status(statusCode).json(errorResponse);
    }
};

// import { Request, Response, NextFunction } from 'express';

// export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
//     console.error(err.stack);

//     if (err.name === 'ValidationError') {
//         return res.status(400).json({ message: err.message });
//     }

//     if (err.name === 'UnauthorizedError') {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     res.status(500).json({ message: 'Internal server error' });
// };