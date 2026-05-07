import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    pregnancy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pregnancy",
      required: true,
    },
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    midwife: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Appointment scheduling
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    preferredDateTime: {
      type: Date,
      required: [true, "Preferred date/time is required"],
    },
    confirmedDateTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CONFIRMED",
        "RESCHEDULE_REQUESTED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    // Rejection details (required if status is REJECTED)
    rejectionReason: {
      type: String,
      trim: true,
    },
    rescheduleReason: {
      type: String,
      trim: true,
    },
    // Midwife checks during visit (filled after mother visits)
    pulseRate: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    bloodPressure: {
      type: String,
      trim: true,
    },
    specialMedicalConditions: {
      type: [String],
      default: [],
    },
    appointmentNotes: {
      type: String,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
appointmentSchema.index({ pregnancy: 1, mother: 1, midwife: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ mother: 1, createdAt: -1 });
appointmentSchema.index({ midwife: 1, createdAt: -1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
