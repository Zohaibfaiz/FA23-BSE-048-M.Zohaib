import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    featureFlags: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    platformName: { type: String, default: 'Doctor Hub' },
  },
  { timestamps: true }
);

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export default SystemConfig;
