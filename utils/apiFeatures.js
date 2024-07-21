class APIFeatures {
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    // Copy querystring and exclude special fields
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.querystring };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering for MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.querystring.sort) {
      const SortBy = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(SortBy);
    }
    return this;
  }

  limitFields() {
    if (this.querystring.fields) {
      const fields = this.querystring.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.querystring.page * 1 || 1;
    const limit = this.querystring.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
