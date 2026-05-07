import { AppointmentService } from "../services/AppointmentService.js";

export class AppointmentController {
  constructor() {
    this.appointmentService = new AppointmentService();
  }

  
   
   //Mother creates appointment for her pregnancy
   
  create = async (req, res, next) => {
    try {
      const user = req.user;
      const { pregnancyId, preferredDateTime } = req.body;

      if (!pregnancyId) {
        return res.status(400).json({
          success: false,
          message: "pregnancyId is required",
        });
      }

      if (!preferredDateTime) {
        return res.status(400).json({
          success: false,
          message: "preferredDateTime is required",
        });
      }

      const appointment =
        await this.appointmentService.createAppointment(
          user,
          pregnancyId,
          preferredDateTime,
        );

      return res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  
   
  //List appointments for authenticated user (mother or midwife)
   
  list = async (req, res, next) => {
    try {
      const user = req.user;
      const appointments = await this.appointmentService.listAppointmentsByUser(
        user,
      );

      return res.json({
        success: true,
        message: "Appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

  
   // Get single appointment by ID with access control
   
  getById = async (req, res, next) => {
    try {
      const user = req.user;
      const appointment = await this.appointmentService.getAppointmentById(
        user,
        req.params.id,
      );

      return res.json({
        success: true,
        message: "Appointment retrieved successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  
  
   // Midwife reviews mother's appointment request (approve/reject)
   
  respond = async (req, res, next) => {
    try {
      const user = req.user;
      const { status, confirmedDateTime, rejectionReason } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "status is required (APPROVED or REJECTED)",
        });
      }

      const appointment =
        await this.appointmentService.respondToAppointment(
          user,
          req.params.id,
          status,
          confirmedDateTime,
          rejectionReason,
        );

      return res.json({
        success: true,
        message:
          status === "APPROVED"
            ? "Appointment approved by midwife"
            : "Appointment rejected successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  
   
   // Mother confirms approved appointment or requests reschedule
  
  motherResponse = async (req, res, next) => {
    try {
      const user = req.user;
      const { status, preferredDateTime, rescheduleReason } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "status is required (CONFIRMED or RESCHEDULE_REQUESTED)",
        });
      }

      const appointment =
        await this.appointmentService.respondToMidwifeDecision(
          user,
          req.params.id,
          status,
          preferredDateTime,
          rescheduleReason,
        );

      return res.json({
        success: true,
        message:
          status === "CONFIRMED"
            ? "Appointment confirmed successfully"
            : "Reschedule request submitted successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  
   
   //Midwife fills appointment information after visit
   
  fillInfo = async (req, res, next) => {
    try {
      const user = req.user;
      const appointmentData = req.body;

      if (!appointmentData.pulseRate) {
        return res.status(400).json({
          success: false,
          message: "pulseRate is required",
        });
      }

      const appointment =
        await this.appointmentService.fillAppointmentInfo(
          user,
          req.params.id,
          appointmentData,
        );

      return res.json({
        success: true,
        message: "Appointment information filled successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  
   
   // Midwife gets upcoming appointments
   
  getUpcoming = async (req, res, next) => {
    try {
      const user = req.user;
      const appointments =
        await this.appointmentService.getUpcomingAppointments(user);

      return res.json({
        success: true,
        message: "Upcoming appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

  

   // Midwife gets completed appointments
   
  getCompleted = async (req, res, next) => {
    try {
      const user = req.user;
      const appointments =
        await this.appointmentService.getCompletedAppointments(user);

      return res.json({
        success: true,
        message: "Completed appointments retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

  
  
   //Get all appointments for a pregnancy
   
  getByPregnancy = async (req, res, next) => {
    try {
      const user = req.user;
      const appointments =
        await this.appointmentService.getAppointmentsByPregnancy(
          user,
          req.params.pregnancyId,
        );

      return res.json({
        success: true,
        message: "Appointments for pregnancy retrieved successfully",
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  };

 
  // Cancel appointment
   
  cancel = async (req, res, next) => {
    try {
      const user = req.user;
      const { cancelReason } = req.body;

      const appointment = await this.appointmentService.cancelAppointment(
        user,
        req.params.id,
        cancelReason,
      );

      return res.json({
        success: true,
        message: "Appointment cancelled successfully",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete appointment (mother who booked it)
  deleteByMother = async (req, res, next) => {
    try {
      const user = req.user;
      await this.appointmentService.deleteAppointmentByMother(
        user,
        req.params.id,
      );

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * AI quick-check for a specific appointment.
   */
  aiCheck = async (req, res, next) => {
    try {
      const user = req.user;
      const result = await this.appointmentService.analyzeAppointmentWithAi(
        user,
        req.params.id,
      );

      return res.json({
        success: true,
        message: "Appointment AI check generated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
