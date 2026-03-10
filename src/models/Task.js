import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['Work', 'Health', 'Learning', 'Personal'],
      default: 'Personal',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // Store as yyyy-MM-dd strings to match the frontend format
    createdAt: {
      type: String,
      required: true,
    },
    completedAt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAtTimestamp', updatedAt: 'updatedAtTimestamp' },
    versionKey: false,
  }
);

// Compound index for efficient per-user queries
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, completedAt: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
