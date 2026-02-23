const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const responseController = require("../controllers/responseController");
const { validateRequest } = require("../middleware/validation");

// Validation rules
const createValidation = [
  body("respondent_name")
    .trim()
    .notEmpty()
    .withMessage("Respondent name is required")
    .isLength({ max: 255 })
    .withMessage("Respondent name must be less than 255 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters"),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ max: 100 })
    .withMessage("Country must be less than 100 characters"),
  body("region")
    .trim()
    .notEmpty()
    .withMessage("Region is required")
    .isLength({ max: 100 })
    .withMessage("Region must be less than 100 characters"),
  body("town")
    .trim()
    .notEmpty()
    .withMessage("Town is required")
    .isLength({ max: 100 })
    .withMessage("Town must be less than 100 characters"),
  body("date_of_report")
    .notEmpty()
    .withMessage("Date of report is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("role").optional().isArray().withMessage("Role must be an array"),
  body("normal_or_wet_conditions")
    .optional()
    .isArray()
    .withMessage("Normal or wet conditions must be an array"),
  body("crop_production_effects")
    .optional()
    .isArray()
    .withMessage("Crop production effects must be an array"),
  body("livestock_production_effects")
    .optional()
    .isArray()
    .withMessage("Livestock production effects must be an array"),
  body("public_health_effects")
    .optional()
    .isArray()
    .withMessage("Public health effects must be an array"),
  body("household_effects")
    .optional()
    .isArray()
    .withMessage("Household effects must be an array"),
  body("business_industry_effects")
    .optional()
    .isArray()
    .withMessage("Business industry effects must be an array"),
  body("forest_effects")
    .optional()
    .isArray()
    .withMessage("Forest effects must be an array"),
];

const updateValidation = [
  param("id").isUUID().withMessage("Invalid response ID"),
  body("respondent_name")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Respondent name must be less than 255 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 255 })
    .withMessage("Email must be less than 255 characters"),
  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country must be less than 100 characters"),
  body("region")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Region must be less than 100 characters"),
  body("town")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Town must be less than 100 characters"),
  body("date_of_report")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
];

const idValidation = [param("id").isUUID().withMessage("Invalid response ID")];

const queryValidation = [
  query("email").optional().isEmail().withMessage("Invalid email format"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format"),
];

// Routes
router.post("/", createValidation, validateRequest, responseController.create);

router.get("/", queryValidation, validateRequest, responseController.findAll);

router.get("/:id", idValidation, validateRequest, responseController.findById);

router.put(
  "/:id",
  updateValidation,
  validateRequest,
  responseController.update
);

router.delete("/:id", idValidation, validateRequest, responseController.delete);

module.exports = router;
