import mongoose, { Schema, model, models } from 'mongoose';

const DatasetSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String, // Original filename or user-given name
    required: true,
  },
  data: {
    type: Array, // Array of objects (rows)
    required: true,
  },
}, { timestamps: true });

const Dataset = models.Dataset || model('Dataset', DatasetSchema);

export default Dataset;
