import { Appointment } from "../models/Appointment.js";

export class AppointmentRepository {
  async create(data) {
    const appointment = new Appointment(data);
    return await appointment.save();
  }

  async findById(id) {
    return await Appointment.findById(id)
      .populate("pregnancy")
      .populate("mother", "fullName email contactNumber")
      .populate("midwife", "fullName email contactNumber");
  }

  async findByIdBasic(id) {
    return await Appointment.findById(id);
  }

  async update(id, updateData) {
    return await Appointment.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("pregnancy")
      .populate("mother", "fullName email contactNumber")
      .populate("midwife", "fullName email contactNumber");
  }

  async findByPregnancyId(pregnancyId) {
    return await Appointment.find({ pregnancy: pregnancyId })
      .populate("mother", "fullName email contactNumber")
      .populate("midwife", "fullName email contactNumber")
      .sort({ appointmentDate: 1 });
  }

  async findByPregnancyIds(pregnancyIds) {
    return await Appointment.find({ pregnancy: { $in: pregnancyIds } })
      .populate("pregnancy")
      .populate("mother", "fullName email contactNumber")
      .populate("midwife", "fullName email contactNumber")
      .sort({ appointmentDate: 1 });
  }

  async findByMotherId(motherId) {
    return await Appointment.find({ mother: motherId })
      .populate("pregnancy")
      .populate("midwife", "fullName email contactNumber")
      .sort({ createdAt: -1 });
  }

  async findByMidwifeId(midwifeId) {
    return await Appointment.find({ midwife: midwifeId })
      .populate("pregnancy")
      .populate("mother", "fullName email contactNumber")
      .sort({ appointmentDate: 1 });
  }

  async findPendingByMotherAndPregnancy(motherId, pregnancyId) {
    return await Appointment.findOne({
      mother: motherId,
      pregnancy: pregnancyId,
      status: "PENDING",
    })
      .populate("pregnancy")
      .populate("midwife", "fullName email contactNumber");
  }

  async findActiveByMotherAndPregnancy(motherId, pregnancyId) {
    return await Appointment.findOne({
      mother: motherId,
      pregnancy: pregnancyId,
      status: {
        $in: ["PENDING", "RESCHEDULE_REQUESTED", "APPROVED", "CONFIRMED"],
      },
      isCompleted: false,
    })
      .populate("pregnancy")
      .populate("midwife", "fullName email contactNumber");
  }

  async findUpcomingByMidwife(midwifeId) {
    const now = new Date();
    return await Appointment.find({
      midwife: midwifeId,
      appointmentDate: { $gte: now },
      status: "CONFIRMED",
      isCompleted: false,
    })
      .populate("pregnancy")
      .populate("mother", "fullName email contactNumber")
      .sort({ appointmentDate: 1 });
  }

  async findCompletedByMidwife(midwifeId) {
    return await Appointment.find({
      midwife: midwifeId,
      isCompleted: true,
    })
      .populate("pregnancy")
      .populate("mother", "fullName email contactNumber")
      .sort({ completedAt: -1 });
  }

  async findByStatusAndPregnancy(pregnancyId, status) {
    return await Appointment.find({
      pregnancy: pregnancyId,
      status: status,
    })
      .populate("mother", "fullName email contactNumber")
      .populate("midwife", "fullName email contactNumber");
  }

  async delete(id) {
    return await Appointment.findByIdAndDelete(id);
  }
}
