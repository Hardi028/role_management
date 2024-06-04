const Role = require('../models/role');

exports.createRole = async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).send(role);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getRoles = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex for search
      query = { roleName: { $regex: searchRegex } };
    }

    const roles = await Role.find(query);
    res.status(200).send(roles);
  } catch (err) {
    res.status(500).send({ error: 'An error occurred while fetching roles.' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const role = await Role.findByIdAndUpdate(id, updates, { new: true });
    if (!role) {
      return res.status(404).send('Role not found.');
    }
    res.status(200).send(role);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).send('Role not found.');
    }
    res.status(200).send({ message: 'Role deleted successfully.' });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.addAccessModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleId, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).send('Role not found.');
    }

    role.accessModules.push({ moduleId, permissions });
    await role.save();

    res.status(200).send(role);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.removeAccessModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleId } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).send('Role not found.');
    }

    role.accessModules = role.accessModules.filter(module => module.moduleId !== moduleId);
    await role.save();

    res.status(200).send(role);
  } catch (err) {
    res.status(400).send(err);
  }
};
