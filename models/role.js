const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  accessModules: {
    type: [{
      moduleId: {
        type: String,
        required: true
      },
      permissions: {
        type: [String],
        enum: ['read', 'create', 'update', 'delete'],
        default: ['read']
      }
    }],
    default: [],
    validate: {
      validator: function (v) {
        const uniqueModules = new Set(v.map(item => item.moduleId));
        return uniqueModules.size === v.length;
      },
      message: props => `${props.value} has duplicate moduleIds`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Role', roleSchema);
