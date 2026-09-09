const mongoose = require("mongoose");

/**
 * Saved age calculation document.
 * Keep fields simple for viva explanation.
 */
const calculationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
      trim: true
    },
    birthDate: {
      type: String,
      required: true
    },
    calculationType: {
      type: String,
      required: true,
      trim: true
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Calculation", calculationSchema);
