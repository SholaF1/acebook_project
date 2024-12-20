const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const User = require("../../models/user");
const Alliance = require("../../models/alliance")
const { fakeUserOne, fakeUserTwo, fakeUserThree, fakeUserFour } = require("../fakeUsers")
const { generateToken, decodeToken } = require("../../lib/token")

require("../mongodb_helper")

const secret = process.env.JWT_SECRET;

function createToken(userId) {
    return JWT.sign(
      {
        user_id: userId,
        // Backdate this token of 5 minutes
        iat: Math.floor(Date.now() / 1000) - 5 * 60,
        // Set the JWT token to expire in 10 minutes
        exp: Math.floor(Date.now() / 1000) + 10 * 60,
      },
      secret
    );
}

let token;
let userOne;
let userTwo;
let userThree;

describe('/alliances', () => {
    beforeAll(async () => {
        await Alliance.deleteMany({});
        await User.deleteMany({});
    })

    beforeEach(async () => {
        await Alliance.deleteMany({});
        await User.deleteMany({});
        userOne = await new User(fakeUserOne).save();
        userTwo = await new User(fakeUserTwo).save();
        userThree = await new User(fakeUserThree).save();
        tokenOne = createToken(userOne._id);
        tokenTwo = createToken(userTwo._id);
        tokenThree = createToken(userThree._id);
    })

    describe("POST, when a valid token is present", () => {
        it("returns a response code of 201 when a new alliance is requested", async () => {
            const response = await request(app)
                .post(`/alliances/${userTwo._id}`)
                .set("Authorization", `Bearer ${tokenOne}`)

            expect(response.status).toEqual(201);
        })
        it("correctly adds a new alliance to the database when the sender requests one", async () => {
            const response = await request(app)
                .post(`/alliances/${userTwo._id}`)
                .set("Authorization", `Bearer ${tokenOne}`)
            
            const alliance = await Alliance.findOne({sender: userOne._id})
    
            expect(alliance.receiver).toEqual(userTwo._id);
            expect(alliance.status).toEqual("pending")
        })
        it("correctly removes a pending alliance if a sender changes their mind", async () => {
            const responseOne = await request(app)
                .post(`/alliances/${userTwo._id}`)
                .set("Authorization", `Bearer ${tokenOne}`)
                
            expect(responseOne.body.alliance.sender).toEqual(userOne._id.toString())
            expect(responseOne.body.alliance.receiver).toEqual(userTwo._id.toString())
        
            const receiverId = responseOne.body.alliance.receiver

            const responseTwo = await request(app)
                .post(`/alliances/${receiverId}/cancel`)
                .set("Authorization", `Bearer ${tokenOne}`)
                
            expect(responseTwo.status).toEqual(200)
            expect(await Alliance.findOne({sender: userOne._id})).toBeNull();
        })
        it("adds user ids to the correct users friend lists when a reciever accepts an alliance request" , async () => {
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const acceptRequestResponse = await request(app)
                .post(`/alliances/${userOne._id}/forge`)
                .set("Authorization", `Bearer ${tokenTwo}`)
        
            expect(acceptRequestResponse.status).toEqual(200)
            const updatedAllianceOne = await Alliance.findOne({ sender: userOne._id, receiver: userTwo._id })
            expect(updatedAllianceOne.status).toEqual("accepted")
            const updatedUserOne = await User.findOne({_id: userOne._id})
            const updatedUserTwo = await User.findOne({_id: userTwo._id})
            expect(updatedUserOne.alliances).toEqual([userTwo._id])
            expect(updatedUserTwo.alliances).toEqual([userOne._id])
        })
        it("forges mutiple alliances", async () => {
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();
            const responseOne = await request(app)
                .post(`/alliances/${userOne._id}/forge`)
                .set("Authorization", `Bearer ${tokenTwo}`)
                
            const responseTwo = await request(app)
                .post(`/alliances/${userThree._id}/forge`)
                .set("Authorization", `Bearer ${tokenTwo}`)

            const updatedUserOne = await User.findOne({_id: userOne._id})
            const updatedUserTwo = await User.findOne({_id: userTwo._id})
            const updatedUserThree = await User.findOne({_id: userThree._id})
            expect(updatedUserOne.alliances).toEqual([userTwo._id])
            expect(updatedUserTwo.alliances).toEqual([userOne._id, userThree._id])
            expect(updatedUserThree.alliances).toEqual([userTwo._id])
        })

    })
    
    // describe("POST, when token is missing or invalid", () => {
    
    // } )
    
    describe("GET, when a valid token is present", () => {
        it("returns a list of a users pending requests", async () => {
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();
            const allianceThree = await new Alliance({ sender: userThree._id, receiver: userOne._id }).save();

            const findRequestsResponse = await request(app)
                .get(`/alliances/${userTwo._id.toString()}/receivedRequestsAdmin`)
                .set("Authorization", `Bearer ${tokenTwo}`)
            expect(findRequestsResponse.status).toEqual(200)
            expect(findRequestsResponse.body.receivedRequests).toEqual([
                expect.objectContaining({
                    _id: allianceOne._id.toString(),
                    sender: userOne._id.toString(),
                    receiver: userTwo._id.toString()
                }),
                expect.objectContaining({
                    _id: allianceTwo._id.toString(),
                    sender: userThree._id.toString(),
                    receiver: userTwo._id.toString()
                }) 
            ])
        })
        it("allows a user to view basic data of people who have requested alliances", async () => {
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();
            const allianceThree = await new Alliance({ sender: userThree._id, receiver: userOne._id }).save();

            const findRequestsResponse = await request(app)
                .get(`/alliances/viewReceivedRequests`)
                .set("Authorization", `Bearer ${tokenTwo}`)
            expect(findRequestsResponse.status).toEqual(200)
            expect(findRequestsResponse.body.usersThatRequested).toEqual([{
                _id: userOne._id.toString(),
                firstname: "John",
                lastname: "Doe",
                location: "New York, USA",
                profilePicture: "https://example.com/images/user_one.jpg"
            }, {
                _id: userThree._id.toString(),
                firstname: "Max",
                lastname: "Power",
                location: "Los Angeles, USA",
                profilePicture: "https://example.com/images/user_one.jpg"
            }
        ])
        })
        it("allows a user to view basic data of all people available for alliances", async () => {
            const allianceOne = await new Alliance({ sender: userTwo._id, receiver: userOne._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();
            const allianceThree = await new Alliance({ sender: userThree._id, receiver: userOne._id }).save();

            const findUsersResponse = await request(app)
                .get('/alliances/viewPotentialAlliances')
                .set("Authorization", `Bearer ${tokenTwo}`)
            
            expect(findUsersResponse.status).toEqual(200)
            expect(findUsersResponse.body.usersWithAlliancesData).toEqual([{
                    _id: userOne._id.toString(),
                    allianceId: allianceOne._id.toString(),
                    allianceRole: "sender",
                    firstname: "John",
                    lastname: "Doe",
                    location: "New York, USA",
                    profilePicture: "https://example.com/images/user_one.jpg",
                    status: "pending"
                }, {
                    _id: userThree._id.toString(),
                    allianceId: allianceTwo._id.toString(),
                    allianceRole: "receiver",
                    firstname: "Max",
                    lastname: "Power",
                    location: "Los Angeles, USA",
                    profilePicture: "https://example.com/images/user_one.jpg",
                    status: "pending"
                }
            ])
        })
        it("allows a user to view basic data of people they have forged alliances with", async () => {
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();
            const allianceThree = await new Alliance({ sender: userThree._id, receiver: userOne._id }).save();
            
            const Response = await request(app)
                .post(`/alliances/${userOne._id}/forge`)
                .set("Authorization", `Bearer ${tokenTwo}`)
            

            const findForgedResponse = await request(app)
                .get('/alliances/viewForgedAlliances')
                .set("Authorization", `Bearer ${tokenTwo}`)
            
            expect(findForgedResponse.status).toEqual(200)
            expect(findForgedResponse.body.alliances[0]).toEqual({
                _id: userOne._id.toString(),
                firstname: "John",
                lastname: "Doe",
                location: "New York, USA",
                profilePicture: "https://example.com/images/user_one.jpg"
            }
            )
        })
        it("returns a single alliance when given an id", async () => {
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();

            const response = await request(app)
                .get(`/alliances/${allianceOne._id}/find`)
                .set("Authorization", `Bearer ${tokenTwo}`)
            
            expect(response.status).toEqual(200)
            expect(response.body.alliance).toEqual(
                expect.objectContaining({
                    _id: allianceOne._id.toString(),
                    sender: userOne._id.toString(),
                    receiver: userTwo._id.toString(),
                    status: "pending",
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String) 
            }))
        })
        it("returns basic info of all users along with whether they have previously requested a friendship", async () => {
            // This was a testing gorund for adding alliance status to the usersdata
            // const userFour = await new User(fakeUserFour).save()
            // const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            // const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();
            // const allianceThree = await new Alliance({ sender: userThree._id, receiver: userOne._id }).save();
            
            const allianceOne = await new Alliance({ sender: userOne._id, receiver: userTwo._id }).save();
            const allianceTwo = await new Alliance({ sender: userThree._id, receiver: userTwo._id }).save();

            const response = await request(app)
                .get(`/alliances/${allianceOne._id}/findAllianceWithUserRole`)
                .set("Authorization", `Bearer ${tokenOne}`)
            
            console.log(response.body)
            })
        //         try {
        //             const currentUser = userTwo._id
        //             const otherUsers = await User.find({ _id: { $ne: currentUser }}, "_id firstname lastname location profilePicture")

        //             const userWithAlliance = await Promise.all(otherUsers.map(async (user) => {
        //                 alliance = await Alliance.findOne({
        //                     $or: [
        //                         { sender: currentUser, receiver: user._id },
        //                         { receiver: currentUser, sender: user._id },
        //                     ]
        //                 })
        //                 const plainUser = user.toObject()
        //                 if (alliance) {
        //                     plainUser["status"] = alliance.status
        //                     if (alliance.sender === currentUser) {
        //                         plainUser["allianceRole"] = "sender"
        //                     }
        //                     else {
        //                         plainUser["allianceRole"] = "receiver"
        //                     }
        //                     plainUser['allianceWithUserId'] = alliance._id
        //                 } 
        //                 else {
        //                     plainUser["status"] = "none"
        //                 }
        //                 return plainUser
        //                 }
        //         ))
        //         // console.log(userWithAlliance)

        //         // const allianceUpdate = await Alliance.findOne({ _id: userWithAlliance[0].allianceWithUserId })
        //         //     // .select('sender receiver status')

        //         // // if (!allianceUpdate) {
        //         // //     role = "none"
        //         // // }
        //         // console.log(allianceUpdate)


        //     } catch (error) {
        //             console.log(error)
        //         }
                
        //     // try {
        //     //     const currentUser = UserTwo._id
        //     //     const userToFind = userOne._id

        //     // } catch (error) {
        //     //     console.log(error)
        //     // }
                

        // })

    })
})
