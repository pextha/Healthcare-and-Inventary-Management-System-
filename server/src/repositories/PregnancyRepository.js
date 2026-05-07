import { Pregnancy } from "../models/Pregnancy.js";

export class PregnancyRepository {
  async create(data) {
    const p = new Pregnancy(data);
    return await p.save();
  }

  //find active pregnancies
  async findActiveByUser(userId) {
    return await Pregnancy.findOne({ user: userId, status: "ACTIVE" });
  }

  async findById(id) {
    return await Pregnancy.findById(id);
  }

  async findByIdPopulated(id) {
    return await Pregnancy.findById(id)
      .populate("user", "fullName email")
      .populate("doctor", "fullName email")
      .populate("midwife", "fullName email");
  }

  async assignDoctor(pregnancyId, doctorId) {
    return await Pregnancy.findByIdAndUpdate(
      pregnancyId,
      { doctor: doctorId },
      { returnDocument: "after", runValidators: true },
    );
  }

  async assignMidwife(pregnancyId, midwifeId) {
    return await Pregnancy.findByIdAndUpdate(
      pregnancyId,
      { midwife: midwifeId },
      { returnDocument: "after", runValidators: true },
    );
  }

  async findAllByUser(userId) {
    return await Pregnancy.find({
      user: userId,
      status: { $ne: "CANCELLED" },
    })
      .populate("doctor", "fullName email")
      .populate("midwife", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findAllByDoctor(doctorId) {
    return await Pregnancy.find({
      doctor: doctorId,
      status: { $ne: "CANCELLED" },
    })
      .populate("user", "fullName email")
      .populate("midwife", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findAllByMidwife(midwifeId) {
    return await Pregnancy.find({
      midwife: midwifeId,
      status: { $ne: "CANCELLED" },
    })
      .populate("user", "fullName email")
      .populate("doctor", "fullName email")
      .sort({ createdAt: -1 });
  }

  async update(id, updateData) {
    return await Pregnancy.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
  }
}
