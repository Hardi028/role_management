const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(400).send('Invalid login credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid login credentials.');
    }

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate({
      path: 'role',
      select: 'roleName accessModules'
    });
    res.status(200).send(users);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).send('User not found.');
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send('User not found.');
    }
    res.status(200).send({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).send('User not found.');
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const userId = req.params.userId;
    const moduleId = req.params.moduleId;
    const user = await User.findById(userId).populate('role');

    if (!user) {
      return res.status(404).send('User not found.');
    }

    const accessModule = user.role.accessModules.find(module => module.moduleId === moduleId);

    if (accessModule) {
      res.status(200).send({ access: accessModule.permissions });
    } else {
      res.status(404).send({ message: 'Module not found.' });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

// New method for bulk updating users with the same data
exports.bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).send({ error: 'userIds must be a non-empty array.' });
    }

    if (typeof updates !== 'object' || updates === null) {
      return res.status(400).send({ error: 'updates must be an object.' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updates }
    );

    if (result.nModified === 0) {
      return res.status(404).send({ message: 'No users were updated. Please check the provided userIds.' });
    }

    res.status(200).send({ message: 'Users updated successfully.', result });
  } catch (err) {
    console.error('Error in bulkUpdateUsers:', err);
    res.status(500).send({ error: 'An error occurred while updating users.' });
  }
};

// New method for bulk updating users with different data
exports.bulkUpdateUsersWithDifferentData = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const bulkOps = req.body.map(update => ({
      updateOne: {
        filter: { _id: update.userId },
        update: { $set: update.updates }
      }
    }));

    const result = await User.bulkWrite(bulkOps, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).send(result);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).send(err);
  }
};