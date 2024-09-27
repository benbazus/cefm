import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import { sendConfirmationEmail, sendOtpEmail, sendPasswordResetEmail, sendTwoFactorTokenEmail } from '../utils/email';
import { generateTokens, invalidateRefreshToken } from '../utils/jwt';
import prisma from '../config/database';
import { generateOtp } from '../utils/helpers';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, code } = req.body as { email: string; password: string; code?: string };
        const result = await authService.login(email, password, code);

        if ('success' in result || 'error' in result || 'twoFactor' in result) {
            console.log(" ================================== ")
            console.log(result)
            console.log(" ================================== ")
            return res.json(result);
        }

        const { accessToken, refreshToken, user } = result;

        console.log(" 1111111111111111111111 ")
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        console.log(" 222222222222222222222222 ")
        res.json({
            message: 'Login successful',
            accessToken,
            user,
        });
        console.log(" 33333333333333333333333333 ")
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not found' });
        }

        const result = await authService.refreshAccessToken(refreshToken);

        if (!result || !result.accessToken || !result.refreshToken) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const { accessToken, refreshToken: newRefreshToken } = result;

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ accessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

// export const refreshToken1 = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//             return res.status(401).json({ error: 'Refresh token not found' });
//         }

//         const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

//         res.cookie('refreshToken', newRefreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });

//         res.json({ accessToken });
//     } catch (error) {
//         console.error('Refresh token error:', error);
//         res.status(401).json({ error: 'Invalid refresh token' });
//     }
// };

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
};


export const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });



        if (!user || user.otpToken !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            console.log('+++++++++++++++user++++++++++++++++++++++++ ')
            console.log('Invalid or expired OTP')
            console.log('+++++++++++++user++++++++++++++++++++++++++ ')
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP and mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otpToken: null,
                otpExpires: null,
                emailVerified: new Date(),
            },
        });

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'An error occurred while verifying OTP' });
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });


        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { otp, otpExpires } = generateOtp();

        await prisma.user.update({
            where: { id: user.id },
            data: { lastActive: new Date(), otpToken: otp, otpExpires },
        });

        const existingToken = await prisma.twoFactorToken.findFirst({ where: { email } });

        if (existingToken) {
            await prisma.twoFactorToken.delete({ where: { id: existingToken.id } });
        }

        const token = otp as string;
        const expires = otpExpires as Date;


        await prisma.twoFactorToken.create({
            data: { email, token, expires },
        });

        await sendTwoFactorTokenEmail(email, user.name as string, otp);

        // const { otp, otpExpires } = generateOtp();

        // await prisma.user.update({
        //     where: { id: user.id },
        //     data: {
        //         otpToken: otp,
        //         otpExpires,
        //     },
        // });

        // await sendOtpEmail(email, otp);

        res.json({ message: 'New OTP sent successfully' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'An error occurred while resending OTP' });
    }
};

// ... (rest of the code remains the same)


// import { Request, Response, NextFunction } from 'express';
// import * as authService from '../services/authService';
// import * as userService from '../services/userService';
// import { sendConfirmationEmail, sendPasswordResetEmail } from '../utils/email';
// import { validationResult } from 'express-validator';
// import bcrypt from 'bcrypt';
// import { generateTokens, invalidateRefreshToken } from '../utils/jwt';



// export const login = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { email, password, code } = req.body as { email: string; password: string; code?: string };

//         const result = await authService.login(email, password, code);

//         if ('success' in result || 'error' in result || 'twoFactor' in result) {
//             return res.json(result);
//         }

//         const { accessToken, refreshToken, user } = result;

//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });


//         console.log('+++++++++++++++useAuth++++++++++++++++++++++++ ')
//         console.log(result)
//         console.log('+++++++++++++useAuth++++++++++++++++++++++++++ ')


//         res.json({
//             message: 'Login successful',
//             accessToken,
//             user,
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'An error occurred during login' });
//     }
// };

// export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//             return res.status(401).json({ error: 'Refresh token not found' });
//         }

//         const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

//         res.cookie('refreshToken', newRefreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });

//         res.json({ accessToken });
//     } catch (error) {
//         console.error('Refresh token error:', error);
//         res.status(401).json({ error: 'Invalid refresh token' });
//     }
// };

// export const logout = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // const refreshToken = req.cookies.refreshToken;

//         // console.log('++++++++ refreshToken  +++++++++++++ ')
//         // console.log(refreshToken)
//         // console.log('++++++++v refreshToken +++++++++++++++ ')


//         // if (refreshToken) {
//         //     await invalidateRefreshToken(refreshToken);
//         // }

//         res.clearCookie('refreshToken');
//         res.json({ message: 'Logout successful' });
//     } catch (error) {
//         console.error('Logout error:', error);
//         res.status(500).json({ error: 'An error occurred during logout' });
//     }
// };


export const emailVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;

        // console.log(" +++++++++++verify CONTROLLER Email++++++++++++++ ")
        // console.log(token)
        // console.log(" +++++++++++verify CONTROLLER Email++++++++++++++ ")

        await authService.newVerification(token);
        res.json({ success: 'Email confirmed successfully.' });
    } catch (error) {
        next(error);
    }
};





// //=======================================================================================


// export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { token } = req.params;

//         console.log(" +++++++++++verifyEmail++++++++++++++ ")
//         console.log(token)
//         console.log(" +++++++++++verifyEmail++++++++++++++ ")

//         await authService.confirmEmail(token);
//         res.json({ message: 'Email confirmed successfully.' });
//     } catch (error) {
//         next(error);
//     }
// };

// export const login11 = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { email, password, code } = req.body as { email: string; password: string; code?: string };

//         const result = await authService.login(email, password, code);

//         if ('success' in result || 'error' in result || 'twoFactor' in result) {
//             return res.json(result);
//         }

//         const { accessToken, refreshToken } = result;

//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });

//         res.json({ accessToken });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'An error occurred during login' });
//     }
// };


// export const register = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { name, email, password } = req.body;
//         const user = await authService.createUser(name, email, password);
//         const confirmationToken = await generateTokens(user.id);
//         //  await authService.setConfirmationToken(user.id, confirmationToken);
//         //  await sendConfirmationEmail(user.email as string, confirmationToken);
//         res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
//     } catch (error) {
//         next(error);
//     }
// };


export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        await authService.register(name, email, password);

        res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
    } catch (error) {
        next(error);
    }
};


export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { userId } = req.user as { userId: string };

        const user = await authService.getUserProfile(userId);

        console.log(" ++++++++++getProfile+++++++++++++++ ")
        console.log(userId)
        console.log(user)
        console.log(" +++++++++++getProfile++++++++++++++ ")


        res.json(user);
    } catch (error) {
        next(error);
    }
};


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const resetToken = await authService.createPasswordResetToken(email);
        await sendPasswordResetEmail(email, resetToken);
        res.json({ message: 'Password reset email sent.' });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log(" ++++++++++resetPassword+++++++++++++++ ")
        console.log(token)
        console.log(password)
        console.log(" +++++++++++resetPassword++++++++++++++ ")

        await authService.resetPassword(token, password);
        res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        next(error);
    }
};

