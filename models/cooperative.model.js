const mongoose = require('mongoose');

const cooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  primaryCommodity: {
    type: String,
    trim: true,
    maxlength: 80
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

cooperativeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Cooperative', cooperativeSchema);
