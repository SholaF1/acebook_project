const User = require("../models/user");
const { generateToken } = require("../lib/token");


// createUser function
async function createUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      location,
      firstname,
      lastname,
      profilePicture,
      alliances = [],
      posts = [],
    } = req.body;

  if (!username || !email || !password || !firstname || !lastname) {
    return res.status(400).json({ message: "All required fields must be filled"})
  }
  const user = new User({
    email, 
    password, 
    username, 
    location, 
    firstname,
    lastname,
    profilePicture,
    alliances,
    posts });

    const savedUser = await user.save()

    if (!savedUser) {
      return res.status(409).json({message: "User already exists"})
    }
    res.status(201).json({message: "User successfully created!"})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
  }
  }

// delete function
async function deleteUser(req, res) {
  try {
    const userToDeleteId = req.params.id
    if (userToDeleteId !== req.user_id) {
      return res.status(401).json({ message: "Forbidden! You can only delete your own account!" });
  }

  await Post.deleteMany({ user_id: userToDeleteId })
  await Comment.deleteMany({ userId: userToDeleteId })

  const deletedUser = await User.findByIdAndDelete(userToDeleteId)

  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({message: "User deleted", user: deletedUser}) 
} catch (err) {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
}
};

// update function
async function updateUser(req, res) {
  try {
    const updates = req.body

    const userToUpdatedId = req.params.id
    if (userToUpdatedId !== req.user_id) {
      return res.status(401).json({ message: "Forbidden! You can only update your own account!" });
  }

    const updateUser = await User.findByIdAndUpdate(userToUpdatedId, updates, {new: true})

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
  }

  const newToken = generateToken(req.user_id);

  res.status(200).json({message: "User updated", user: updateUser, token: newToken}) 
} catch (err) {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
}
};

// findBy function
async function findUser(req, res) {
  try {
    const userToFindID = req.params.id

    if (userToFindID !== req.user_id) {
      return res.status(401).json({ message: "Forbidden! You are not logged in!" });
  }
    const foundUser = await User.findById(userToFindID)

    if (!foundUser) {
      return res.status(404).json({message: "User not found"})
    } 
    res.status(200).json({message: "User found", user: foundUser})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
  }
}

// findAll function
async function getUsers(req, res) {
  try {
    const users = await User.find()
    res.status(200).json({users: users})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
  }
}

const UsersController = {
  createUser: createUser,
  deleteUser: deleteUser,
  updateUser: updateUser,
  findUser: findUser,
  getUsers: getUsers,
};

module.exports = UsersController;
