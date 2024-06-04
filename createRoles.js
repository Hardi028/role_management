const mongoose = require('mongoose');
const Role = require('./models/role');
require('dotenv').config();

const createRoles = async () => {
  const adminRole = new Role({
    roleName: 'Admin',
    accessModules: [
      { moduleId: 'users', permissions: ['create', 'read', 'update', 'delete'] },
      { moduleId: 'roles', permissions: ['create', 'read', 'update', 'delete'] }
    ]
  });

  const customerRole = new Role({
    roleName: 'Customer',
    accessModules: [
      { moduleId: 'users', permissions: ['read'] }
    ]
  });

  await adminRole.save();
  await customerRole.save();
};

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  await createRoles();
  console.log('Roles created successfully');
  mongoose.disconnect();
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});
