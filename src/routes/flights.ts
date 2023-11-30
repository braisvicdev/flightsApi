import { Router } from 'express';
import { getByDays } from '../controllers/flights';

const router = Router();

router.get("/", getByDays);

export { router };