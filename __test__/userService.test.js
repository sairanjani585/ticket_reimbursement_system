const userService = require('../src/service/userService');
const userDAO = require('../src/repository/userDAO');
const bcrypt = require("bcrypt");

jest.mock('../src/repository/userDAO');
jest.mock('bcrypt');

describe('Testing User Service postUser', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    const sampleUser = {
            userName: "user1",
            password: "pass1"
        };
         const mockUser = {
            PK: "USER#user1",
            SK: "PROFILE",
            password: "mockedHashedPassword",
            role: "employee",
        };
        const hashedPassword = 'mockedHashedPassword';

    test('postUser returns user data when valid input is provided', async () => {
        bcrypt.hash.mockResolvedValue(hashedPassword);
        userDAO.postUser.mockResolvedValue(mockUser);

        const result = await userService.postUser(sampleUser);

        expect(bcrypt.hash).toHaveBeenCalledTimes(1);
        expect(bcrypt.hash).toHaveBeenCalledWith(sampleUser.password,10);
        expect(result.password).toBe(hashedPassword);

        expect(result).toEqual(mockUser);
        expect(userDAO.postUser).toHaveBeenCalledTimes(1);
        expect(userDAO.postUser).toHaveBeenCalledWith(sampleUser.userName,hashedPassword);
    });

    test("postUser should return User Already Exists for duplicate user", async () => {
        bcrypt.hash.mockResolvedValue(hashedPassword);
        userDAO.postUser.mockResolvedValue("User Already Exists");

        const result = await userService.postUser(sampleUser);

        expect(result).toBe("User Already Exists");
        expect(userDAO.postUser).toHaveBeenCalledTimes(1);
        expect(userDAO.postUser).toHaveBeenCalledWith(sampleUser.userName,hashedPassword);
    });

    test("postUser should return null when error occurs", async () => {
        bcrypt.hash.mockResolvedValue(hashedPassword);
        userDAO.postUser.mockResolvedValue(null);

        const result = await userService.postUser(sampleUser);

        expect(result).toBeNull();
        expect(userDAO.postUser).toHaveBeenCalledTimes(1);
        expect(userDAO.postUser).toHaveBeenCalledWith(sampleUser.userName,hashedPassword);
    });
});

describe('Testing User Service validateLogin', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    const sampleUserName = "user1";
    const samplePassword = "pass1";
    const sampleHashedPassword = "hashedPass1";
    const mockUser = {
            PK: "USER#user1",
            SK: "PROFILE",
            password: "hashedPass1",
            role: "employee",
        };

    test('validateLogin returns user data when valid input is provided', async () => {
        bcrypt.compare.mockResolvedValue(true);
        userDAO.getUserByName.mockResolvedValue(mockUser);

        const result = await userService.validateLogin(sampleUserName,samplePassword);

        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledWith(samplePassword,result.password);
        
        expect(result).toEqual(mockUser);
        expect(userDAO.getUserByName).toHaveBeenCalledTimes(1);
        expect(userDAO.getUserByName).toHaveBeenCalledWith(sampleUserName);
    });

   test('validateLogin fails when user credentials mismatch, wrong username', async () => {
    const sampleWrongUserName = "user2";
        bcrypt.compare.mockResolvedValue(false);
        userDAO.getUserByName.mockResolvedValue(null);

        const result = await userService.validateLogin(sampleWrongUserName,samplePassword);

        expect(bcrypt.compare).toHaveBeenCalledTimes(0);
        
        
        expect(result).toBeNull();
        expect(userDAO.getUserByName).toHaveBeenCalledTimes(1);
        expect(userDAO.getUserByName).toHaveBeenCalledWith(sampleWrongUserName);
    });

    test('validateLogin fails when user credentials mismatch, wrong password', async () => {
    const sampleWrongPassword = "pass2";
        bcrypt.compare.mockResolvedValue(false);
        userDAO.getUserByName.mockResolvedValue(mockUser);

        const result = await userService.validateLogin(sampleUserName,sampleWrongPassword);

        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledWith(sampleWrongPassword,mockUser.password);
        
        expect(result).toBeNull();
        expect(userDAO.getUserByName).toHaveBeenCalledTimes(1);
        expect(userDAO.getUserByName).toHaveBeenCalledWith(sampleUserName);
    });

    
});

