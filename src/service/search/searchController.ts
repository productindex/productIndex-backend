import express from "express";
const router = express.Router();
const searchService = require("./searchService");

router.get("/search", async (req: any, res: any) => {
  const {location, search } = req.query
    try {
        return res
        .status(200)
        .json(await searchService.businessFuzzySearch(search, location));
    } catch (e : any) {
      return res
      .status(400)
      .json({error: e.message});
    }
  });

module.exports = router;
