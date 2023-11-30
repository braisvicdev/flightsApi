import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import getFlightsResults from "../services/flights.service";

const getByDays = async (req: Request, res: Response) => {
    try {
        const response = await getFlightsResults(req.query);
        res.send(response)
    } catch (error) {
          handleHttp(res, String(error));
    }
};

export { getByDays }