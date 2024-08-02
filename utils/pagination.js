exports.pagination = async (
  model,
  query,
  page = 1,
  limit = 10,
  select = {},
  sort = { _id: -1 },
  populate = [],
) => {
  let startIndex = (page - 1) * limit;
  let result = {};
  let total;

  try {
    total = await model.countDocuments(query);
    result.result = await model
      .find(query)
      .populate(populate)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .select(select);

    result.totalPage = Math.ceil(total / limit);
    result.totalDocuments = total;
    return result;
  } catch (error) {
    logger.log(`Error from pagination function => ${error}`, 'error');
  }
};
