require("../mongodb_helper");
const User = require("../../models/user");

describe("User model", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("has an email address", () => {
    const user = new User({
      username: "Test_Username",
      email: "someone@example.com",
      password: "password",
      // firstname: "testFirstName",
      // lastname: "testLastName",
    });
    expect(user.email).toEqual("someone@example.com");
  });

  it("has a password", () => {
    const user = new User({
      username: "Test_Username",
      email: "someone@example.com",
      password: "password",
      // firstname: "testFirstName",
      // lastname: "testLastName",
    });
    expect(user.password).toEqual("password");
  });

  it("has a usename", () => {
    const user = new User({
      username: "Test_Username",
      email: "someone@example.com",
      password: "password",
      // firstname: "testFirstName",
      // lastname: "testLastName",
    });
    expect(user.username).toEqual("Test_Username");
  });

  it("has a location", () => {
    const user = new User({
      username: "Test_Username",
      email: "someone@example.com",
      password: "password",
      location: "Test Location"
      // firstname: "testFirstName",
      // lastname: "testLastName",
    });
    expect(user.location).toEqual("Test Location");
  });

  it("sets createdAt when a new user is created", () => {
    const user = new User({
      username: "Test_Username",
      email: "someone@example.com",
      password: "password",
      // firstname: "testFirstName",
      // lastname: "testLastName",
    });
    expect(user.createdAt).toBeDefined();
    const now = new Date();
    const difference = Math.abs(now - user.createdAt);
    expect(difference).toBeLessThan(1000);
  });

  // it("has a first name", () => {
  //   const user = new User({
  //     username: "Test_Username",
  //     email: "someone@example.com",
  //     password: "password",
  //     firstname: "testFirstName",
  //     lastname: "testLastName",
  //   });
  //   expect(user.firstname).toEqual("testFirstName");
  // });

  // it("has a last name", () => {
  //   const user = new User({
  //     username: "Test_Username",
  //     email: "someone@example.com",
  //     password: "password",
  //     firstname: "testFirstName",
  //     lastname: "testLastName",
  //   });
  //   expect(user.lastname).toEqual("testLastName");
  // });

  it("can list all users", async () => {
    const users = await User.find();
    expect(users).toEqual([]);
  });

  it("can save a user", async () => {
    const user = new User({
      username: "Test_Username",
      email: "someone@example.com",
      password: "password",
      // firstname: "testFirstName",
      // lastname: "testLastName",
    });

    await user.save();
    const users = await User.find();

    expect(users[0].username).toEqual("Test_Username");
    expect(users[0].email).toEqual("someone@example.com");
    expect(users[0].password).toEqual("password");
    // expect(users[0].firstname).toEqual("testFirstName");
    // expect(users[0].lastname).toEqual("testLastName");
  });
});
