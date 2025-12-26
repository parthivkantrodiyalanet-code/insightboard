import mongoose, { Schema, model, models } from 'mongoose';

const ChartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['bar', 'line', 'pie', 'area', 'scatter'],
    required: true,
  },
  xAxisKey: {
    type: String,
    required: true,
  },
  yAxisKey: { // can be multiple for some charts, but let's start simple
    type: String, 
    required: true,
  },
  color: {
    type: String,
    default: '#8884d8', 
  }
}, { timestamps: true });

const Chart = models.Chart || model('Chart', ChartSchema);

export default Chart;
