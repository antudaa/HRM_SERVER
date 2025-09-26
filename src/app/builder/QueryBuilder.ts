import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;

    if (searchTerm) {
      const searchCondition = {
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            }) as FilterQuery<T>,
        ),
      };
      this.modelQuery = this.modelQuery.find(searchCondition);
    }
    return this;
  }

  filter() {
    const queryObject = { ...this.query };

    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];

    excludeFields.forEach((element) => delete queryObject[element]);

    if (queryObject.category === "") {
      return this;
    }

    this.modelQuery = this.modelQuery.find(queryObject as FilterQuery<T>);
    return this;
  }

  sort() {
    let sortField =
      (this?.query?.sort as string)?.split(",")?.join(" ") || "price";

    if (sortField.includes("rating")) {
      sortField = sortField.replace("rating", "-rating");
    }

    this.modelQuery = this.modelQuery.sort(sortField);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(",").join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  async getTotalCount() {
    const countQuery = this.modelQuery.model.countDocuments(
      this.modelQuery.getQuery() as FilterQuery<T>,
    );
    const count = await countQuery;
    return count;
  }
}

export default QueryBuilder;
