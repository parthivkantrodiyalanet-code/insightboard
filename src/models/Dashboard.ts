import mongoose, { Schema, model, models } from 'mongoose';

const DashboardSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    // Not required initially, can be linked later
  },
  name: {
    type: String,
    required: [true, 'Please provide a dashboard name'],
  },
  description: {
    type: String,
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Dashboard = models.Dashboard || model('Dashboard', DashboardSchema);

export default Dashboard;
