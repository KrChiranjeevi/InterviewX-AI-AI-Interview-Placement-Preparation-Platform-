const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  weeks: [
    {
      title: String,
      topics: [String],
      tasks: [
        {
          title: String,
          completed: {
            type: Boolean,
            default: false,
          },
        }
      ],
      completed: {
        type: Boolean,
        default: false,
      }
    }
  ],
  progress: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
