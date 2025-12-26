import mongoose, { Schema, model, models } from 'mongoose';

const WidgetSchema = new Schema({
  dashboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['bar', 'line', 'pie', 'area', 'scatter', 'kpi'],
    required: true,
  },
  config: {
    type: Object, // Flexible config based on type
    // e.g. for Chart: { xAxisKey: 'Month', yAxisKey: 'Sales', color: '#...' }
    // e.g. for KPI: { column: 'Revenue', operation: 'sum', label: 'Total Revenue' }
    required: true,
  }
}, { timestamps: true });

const Widget = models.Widget || model('Widget', WidgetSchema);

export default Widget;
