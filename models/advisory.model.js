const mongoose = require('mongoose');

const SEVERITIES = ['info', 'warning', 'critical'];

const advisorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 160
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  crop: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  region: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  severity: {
    type: String,
    enum: SEVERITIES,
    default: 'info'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

advisorySchema.index({ crop: 1 });
advisorySchema.index({ region: 1 });

advisorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Advisory', advisorySchema);
module.exports.SEVERITIES = SEVERITIES;
