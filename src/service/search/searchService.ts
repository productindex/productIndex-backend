const searchRepo = require("./searchRepo");


const businessFuzzySearch = async (searchCriteria: string, location: string) => {
    const storeLocation = location.toLocaleUpperCase()
    const criteria = searchCriteria.toLocaleUpperCase()
    if (!searchCriteria) throw Error("Business name is required");
    try {
      return await searchRepo.businessSearch(criteria, storeLocation);
    } catch (e) {
      throw e;
    }
  };


module.exports = {
  businessFuzzySearch
};