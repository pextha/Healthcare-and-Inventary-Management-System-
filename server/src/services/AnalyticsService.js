import { User } from "../models/User.js";
import { Pregnancy } from "../models/Pregnancy.js";
import { Appointment } from "../models/Appointment.js";
import { Chat } from "../models/Chat.js";

export class AnalyticsService {
  async getSystemStats() {
    const [userStats, pregnancyStats, appointmentStats, chatStats] =
      await Promise.all([
        this._getUserStats(),
        this._getPregnancyStats(),
        this._getAppointmentStats(),
        this._getChatStats(),
      ]);

    return { userStats, pregnancyStats, appointmentStats, chatStats };
  }

  async _getUserStats() {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$role",
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
        },
      },
    ];

    const results = await User.aggregate(pipeline);

    const byRole = { MOTHER: 0, DOCTOR: 0, MIDWIFE: 0, ADMIN: 0 };
    const activeByRole = { MOTHER: 0, DOCTOR: 0, MIDWIFE: 0, ADMIN: 0 };
    let totalActive = 0;
    let totalInactive = 0;
    let total = 0;

    for (const row of results) {
      byRole[row._id] = row.total;
      activeByRole[row._id] = row.active;
      totalActive += row.active;
      totalInactive += row.inactive;
      total += row.total;
    }

    // Pending validation: inactive doctors + midwives
    const pendingValidation = await User.countDocuments({
      isDeleted: false,
      isActive: false,
      role: { $in: ["DOCTOR", "MIDWIFE"] },
    });

    // New users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      isDeleted: false,
      createdAt: { $gte: thirtyDaysAgo },
    });

    return {
      total,
      byRole,
      activeByRole,
      totalActive,
      totalInactive,
      pendingValidation,
      newUsersLast30Days,
    };
  }

  async _getPregnancyStats() {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];

    const statusResults = await Pregnancy.aggregate(pipeline);
    const byStatus = { ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const row of statusResults) {
      if (byStatus[row._id] !== undefined) byStatus[row._id] = row.count;
    }

    // Trimester breakdown (active pregnancies only)
    const trimesterPipeline = [
      { $match: { status: "ACTIVE", trimester: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$trimester",
          count: { $sum: 1 },
        },
      },
    ];

    const trimesterResults = await Pregnancy.aggregate(trimesterPipeline);
    const byTrimester = { FIRST: 0, SECOND: 0, THIRD: 0 };
    for (const row of trimesterResults) {
      if (byTrimester[row._id] !== undefined) byTrimester[row._id] = row.count;
    }

    // Pregnancies with no doctor assigned (covers missing field and explicit null)
    const unassignedDoctor = await Pregnancy.countDocuments({
      status: "ACTIVE",
      $or: [{ doctor: { $exists: false } }, { doctor: null }],
    });

    const total =
      (byStatus.ACTIVE ?? 0) +
      (byStatus.COMPLETED ?? 0) +
      (byStatus.CANCELLED ?? 0);

    return { total, byStatus, byTrimester, unassignedDoctor };
  }

  async _getAppointmentStats() {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];

    const statusResults = await Appointment.aggregate(pipeline);
    const byStatus = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CONFIRMED: 0,
      RESCHEDULE_REQUESTED: 0,
      CANCELLED: 0,
    };

    for (const row of statusResults) {
      if (byStatus[row._id] !== undefined) byStatus[row._id] = row.count;
    }

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const completed = await Appointment.countDocuments({ isCompleted: true });

    return { total, byStatus, completed };
  }

  async _getChatStats() {
    const totalChats = await Chat.countDocuments();
    return { totalChats };
  }
}
