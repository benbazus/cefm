
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
//import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { sendConfirmationEmail, sendPasswordResetEmail } from '../utils/email';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { User } from '@prisma/client';
import { generateTokens, verifyAccessToken } from '../utils/jwt';




export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        // console.log(" ###############VVVV################ ")
        // //console.log(token)
        // console.log(" ############VVVVVVV################### ")


        const { name, email, password } = req.body as { name: string; email: string; password: string };
        // const user = await userService.createUser(name, email, password);
        await userService.register(name, email, password);

        // if (!user) {
        //     res.status(400).json({ error: 'User registration failed' });
        // }


        //   const confirmationToken = generateToken(user.id as string );

        // await userService.setConfirmationToken(user.id, confirmationToken);

        //  await sendConfirmationEmail(user.email as string, confirmationToken);

        res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
    } catch (error) {
        next(error);
    }
};


//=======================================================================================================

// export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             res.status(400).json({ errors: errors.array() });
//         }

//         const { email, password, code } = req.body as { email: string; password: string; code?: string };


//         const token = await userService.login(email, password, code as string);

//         // Secure cookie settings
//         res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

//         res.json({
//             message: 'Login successful',
//             token,
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         next(error);
//     }
// };

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.user as { userId: string };
        const user = await userService.getUserProfile(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};


// export const confirmEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { token } = req.params as { token: string };
//         await userService.confirmEmail(token);

//         res.json({ message: 'Email confirmed successfully.' });
//     } catch (error) {
//         next(error);
//     }
// };

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body as { email: string };
        const resetToken = await userService.createPasswordResetToken(email);

        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'Password reset email sent.' });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.params as { token: string };
        const { password } = req.body as { password: string };

        await userService.resetPassword(token, password);

        res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        next(error);
    }
};

// export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { refreshToken } = req.body as { refreshToken: string };
//         const userId = await userService.validateRefreshToken(refreshToken);

//         if (!userId) {
//             res.status(401).json({ error: 'Invalid refresh token' });
//         }

//         const newAccessToken = generateTokens(userId);
//         res.json({ accessToken: newAccessToken });
//     } catch (error) {
//         next(error);
//     }
// };

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<User | null> => {
    try {
        const authHeader = req.headers.authorization;

        console.log(" +++++++++ getCurrentUser +++++++++++++++ ");
        console.log(authHeader);
        console.log(" +++++++++ getCurrentUser +++++++++++++++ ");

        if (!authHeader) return null;

        const token = authHeader.split(' ')[1];

        if (!token) return null;

        //const userId: string | null = verifyAccessToken(token);
        const userId = verifyAccessToken(token);

        if (userId === null || userId === undefined) {
            throw new Error('Invalid access token');
        }

        const user = await prisma.user.findUnique({ where: { id: "userId" } });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// import { Request, Response, NextFunction } from 'express';
// import * as userService from '../services/userService';
// import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
// import { sendConfirmationEmail, sendPasswordResetEmail } from '../utils/email';
// import { validationResult } from 'express-validator';
// import prisma from '../config/database';


// interface DecodedToken {
//     userId: string;
//     email: string;
// }

// export const login = async (req: Request, res: Response, next: NextFunction) => {

//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { email, password, code } = req.body;

//         const token = await userService.login(email, password, code);

//         res.cookie('token', token, { httpOnly: true });

//         console.log(" ############################### ")
//         console.log(token)
//         console.log(" ############################### ")


//         res.json({
//             message: 'Login successful', token
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'An error occurred during login' });
//     }
// }


// export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { userId } = req.user as { userId: string };
//         const user = await userService.getUserProfile(userId);
//         res.json(user);
//     } catch (error) {
//         next(error);
//     }
// };

// export const register = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { name, email, password } = req.body;
//         const user = await userService.createUser(name, email, password);
//         const confirmationToken = generateToken(user.id);
//         await userService.setConfirmationToken(user.id, confirmationToken);
//         // await sendConfirmationEmail(user.email, confirmationToken);
//         res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
//     } catch (error) {
//         next(error);
//     }
// };

// // export const login = async (req: Request, res: Response, next: NextFunction) => {
// //     try {
// //         const { email, password } = req.body;
// //         const user = await userService.validateUser(email, password);
// //         const accessToken = generateToken(user.id);
// //         const refreshToken = generateRefreshToken(user.id);
// //         res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
// //     } catch (error) {
// //         next(error);
// //     }
// // };

// export const confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { token } = req.params;
//         await userService.confirmEmail(token);
//         res.json({ message: 'Email confirmed successfully.' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { email } = req.body;
//         const resetToken = await userService.createPasswordResetToken(email);
//         await sendPasswordResetEmail(email, resetToken);
//         res.json({ message: 'Password reset email sent.' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { token } = req.params;
//         const { password } = req.body;
//         await userService.resetPassword(token, password);
//         res.json({ message: 'Password reset successfully.' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { refreshToken } = req.body;
//         const userId = await userService.validateRefreshToken(refreshToken);
//         const newAccessToken = generateToken(userId);
//         res.json({ accessToken: newAccessToken });
//     } catch (error) {
//         next(error);
//     }
// };

// export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {

//     try {
//         const authHeader = req.headers.get('authorization');

//         if (!authHeader) return null;

//         const token = authHeader.split(' ')[1];

//         if (!token) return null;

//         const userId = verifyToken(token);

//         const user = await prisma.user.findUnique({ where: { id: userId }, });

//         return user;
//     } catch (error) {
//         console.error('Error getting current user:', error);

//         return null;
//     }
// }

