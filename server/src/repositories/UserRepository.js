import { User } from "../models/User.js";

export class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email) {
    return await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
  }

  async findById(id) {
    return await User.findOne({ _id: id, isDeleted: false });
  }

  async findByIdWithPassword(id) {
    return await User.findOne({ _id: id, isDeleted: false }).select(
      "+password",
    );
  }

  async findByResetToken(hashedToken) {
    return await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isDeleted: false,
    }).select("+password");
  }

  async update(id, updateData) {
    return await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  }

  async updatePassword(id, newPassword) {
    const user = await User.findOne({ _id: id, isDeleted: false }).select(
      "+password",
    );
    if (!user) return null;
    user.password = newPassword;
    return await user.save();
  }

  async findAll(filters = {}, { page = 1, limit = 10, search = "" } = {}) {
    const query = { ...filters, isDeleted: false };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { fullName: new RegExp(`\\b${escaped}`, "i") },
        { email: new RegExp(`^${escaped}`, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return { users, total, page, limit };
  }

  async searchActiveByRole(role, search = "", limit = 10) {
    const query = {
      role,
      isActive: true,
      isDeleted: false,
    };

    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.fullName = new RegExp(escaped, "i");
    }

    return await User.find(query)
      .select("_id fullName email role")
      .sort({ fullName: 1 })
      .limit(limit);
  }

  async delete(id) {
    return await User.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { returnDocument: "after" },
    );
  }
}
