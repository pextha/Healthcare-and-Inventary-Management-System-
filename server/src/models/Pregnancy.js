import mongoose from "mongoose";

const pregnancySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lmpDate: {
      type: Date,
      required: [true, "Last menstrual date is required"],
    },
    cycleLength: {
      type: Number,
      default: 28,
      min: [21, "Cycle length must be at least 21 days"],
      max: [35, "Cycle length must be at most 35 days"],
    },
    isFirstPregnancy: {
      type: Boolean,
      default: false,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    previousComplications: {
      type: [String],
      default: [],
    },
    complicationNotes: {
      type: String,
      trim: true,
    },

    // System generated
    eddDate: {
      type: Date,
    },
    gestationalAgeWeeks: {
      type: Number,
    },
    gestationalAgeDays: {
      type: Number,
    },
    trimester: {
      type: String,
      enum: ["FIRST", "SECOND", "THIRD"],
    },
    pregnancyWeekNumber: {
      type: Number,
    },
    percentageComplete: {
      type: Number,
    },

    // Management
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    midwife: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Pregnancy = mongoose.model("Pregnancy", pregnancySchema);
