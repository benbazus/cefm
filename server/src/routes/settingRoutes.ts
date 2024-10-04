import express from 'express';
import prisma from '../config/database';
import { adminMiddleware, authMiddleware } from '../middleware/auth-middle-ware';


const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        res.send(settings);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await prisma.setting.create({ data: { key, value } });
        res.status(201).send(setting);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.put('/:key', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        const setting = await prisma.setting.update({ where: { key }, data: { value } });
        res.send(setting);
    } catch (error) {
        res.status(400).send(error);
    }
});

export { router as settingsRouter };