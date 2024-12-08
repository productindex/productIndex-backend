import db from "../../models";
const { QueryTypes } = require("sequelize");

const businessSearch = async (searchCriteria: string, location: string) => {
  const stores = await db.sequelize.query(
    "select * from public.search(:p_search_criteria, :p_location)",
    { type: QueryTypes.SELECT, 
      replacements: { p_search_criteria: searchCriteria, p_location: location}}
  );
  
  if (!stores) {
    return null;
  }
  return stores;
};

module.exports = {
  businessSearch,
};
