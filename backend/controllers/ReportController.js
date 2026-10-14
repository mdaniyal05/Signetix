const ServiceFactory = require("../factories/serviceFactory.js");
const ExceptionHelper = require("../exception/ExceptionHelper.js");

const REPORT_REASONS = ["Harassment", "Spam", "Inappropriate Content"];

class ReportController {
  constructor() {}

  //Get all Reports
  getAllReports = async (request, response) => {
    try {
      const reports = await ServiceFactory.getReportService.getDocuments();

      response.json(reports);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Get single Report
  getReportById = async (request, response) => {
    try {
      const reportId = request.params.id;

      const report =
        await ServiceFactory.getReportService.getDocumentById(reportId);

      response.json(report);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };

  //Create a report against another user
  createReport = async (request, response) => {
    try {
      const reporterValidation = await ExceptionHelper.validate(
        request.body.reportedByPhoneNumber,
        400,
        `reportedByPhoneNumber is required!`,
        response
      );
      if (reporterValidation) return reporterValidation;

      const reportedValidation = await ExceptionHelper.validate(
        request.body.reportedUserPhoneNumber,
        400,
        `reportedUserPhoneNumber is required!`,
        response
      );
      if (reportedValidation) return reportedValidation;

      if (!REPORT_REASONS.includes(request.body.reason)) {
        return response
          .status(400)
          .json({ error: `reason must be one of: ${REPORT_REASONS.join(", ")}` });
      }

      const reporter =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: request.body.reportedByPhoneNumber,
        });
      const reporterUserValidation = await ExceptionHelper.validate(
        reporter,
        400,
        `reportedByPhoneNumber doesn't exist in the user table!`,
        response
      );
      if (reporterUserValidation) return reporterUserValidation;

      const reported =
        await ServiceFactory.getUserService.getDocumentByCustomFilters({
          phoneNumber: request.body.reportedUserPhoneNumber,
        });
      const reportedUserValidation = await ExceptionHelper.validate(
        reported,
        400,
        `reportedUserPhoneNumber doesn't exist in the user table!`,
        response
      );
      if (reportedUserValidation) return reportedUserValidation;

      const report = await ServiceFactory.getReportService.saveDocument({
        reportedBy: reporter._id,
        reportedUserId: reported._id,
        reason: request.body.reason,
      });

      response.json(Array.isArray(report) ? report[0] : report);
    } catch (exception) {
      response.status(500).json({ error: exception.message });
    }
  };
}

module.exports = ReportController;
