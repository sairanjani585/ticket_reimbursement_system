const ticketService = require("../src/service/ticketService");
const ticketDAO = require("../src/repository/ticketDAO");

jest.mock("../src/repository/ticketDAO");


describe("Ticket Service for adding, fetching and updating tickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create new ticket", () => {
  const sampleTicket = {
        ticketId : "ticket1",
        userName: "user1",
        amount: 100,
        description: "Test ticket",
        type : 'general'
      };
      crypto.randomUUID = jest.fn();

    test("postTicket Should create a ticket when valid data is provided and return the ticket", async () => {
      const mockTicket = {
        PK : 'USER#user1',
        SK: "TICKET#ticket1",
        amount: sampleTicket.amount,
        description: sampleTicket.description,
        type : sampleTicket.type,
        status: "Pending"
      };
      ticketDAO.postTicket.mockResolvedValue(mockTicket);
      crypto.randomUUID.mockReturnValue("ticket1");
      const result = await ticketService.postTicket(sampleTicket);
      expect(result).toEqual(mockTicket);
      expect(ticketDAO.postTicket).toHaveBeenCalledTimes(1);
      expect(ticketDAO.postTicket).toHaveBeenCalledWith(sampleTicket); 
    });

    test("postTicket would not create a ticket if DB operation fails and return null", async () => {
      ticketDAO.postTicket.mockResolvedValue(null);
      crypto.randomUUID.mockReturnValue("ticket1");
      const result = await ticketService.postTicket(sampleTicket);
      expect(result).toBeNull();
      expect(ticketDAO.postTicket).toHaveBeenCalledTimes(1);
      expect(ticketDAO.postTicket).toHaveBeenCalledWith(sampleTicket); 
    });
  });

  describe("Retrieve all the tickets submitted by a specific user", () => {
    const mockUser = "user1";

    test("getTicketsByUser should return tickets when a valid username is provided", async () => {
      const mockTickets = [
        { PK : 'USER#user1',
        SK: "TICKET#ticket1",
        amount: 200,
        description: "training",
        type : "training",
        status: "Pending" },
        { PK : 'USER#user1',
        SK: "TICKET#ticket2",
        amount: 100,
        description: "food",
        type : "food",
        status: "Approved" }
      ];
      ticketDAO.getTicketsByUser.mockResolvedValue(mockTickets);
      const result = await ticketService.getTicketsByUser(mockUser);
      expect(result).toEqual(mockTickets);
      expect(ticketDAO.getTicketsByUser).toHaveBeenCalledTimes(1);
      expect(ticketDAO.getTicketsByUser).toHaveBeenCalledWith(mockUser);
    });

    test("getTicketsByUser should return null when a user has not submitted any tickets", async () => {
      ticketDAO.getTicketsByUser.mockResolvedValue(null);
      const result = await ticketService.getTicketsByUser(mockUser);
      expect(result).toBeNull();
      expect(ticketDAO.getTicketsByUser).toHaveBeenCalledTimes(1);
      expect(ticketDAO.getTicketsByUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("Retrieve all the tickets which are either pending or approved or denied, depending on the input", () => {
    const mockStatus = "Pending";

    test(" getTicketsByStatus should return tickets if tickets of that status exists", async () => {
      const mockTickets = [
        { PK : 'USER#user1',
        SK: "TICKET#ticket1",
        amount: 200,
        description: "training",
        type : "training",
        status: "Pending" },
        { PK : 'USER#user2',
        SK: "TICKET#ticket2",
        amount: 100,
        description: "food",
        type : "food",
        status: "Pending" }
      ];
      ticketDAO.getTicketsByStatus.mockResolvedValue(mockTickets);
      const result = await ticketService.getTicketsByStatus(mockStatus);
      expect(result).toEqual(mockTickets);
      expect(ticketDAO.getTicketsByStatus).toHaveBeenCalledTimes(1);
      expect(ticketDAO.getTicketsByStatus).toHaveBeenCalledWith(mockStatus);
    });

    test(" getTicketsByStatus should return null if tickets of that status dont exist", async () => {
      ticketDAO.getTicketsByStatus.mockResolvedValue(null);
      const result = await ticketService.getTicketsByStatus(mockStatus);
      expect(result).toBeNull();
      expect(ticketDAO.getTicketsByStatus).toHaveBeenCalledTimes(1);
      expect(ticketDAO.getTicketsByStatus).toHaveBeenCalledWith(mockStatus);
    });
  });

  describe("Update the status of the ticket to approved/denied if its pending, if its already processed, it shouldnt be updated", () =>{
    const mockUser = "user1";
    const mockTicket = "ticket1";
    const mockStatus = "Approved";

     test("updateTicketStatus should update the ticket status and return the updated ticket if the ticket is Pending", async () => {
      const mockUpdatedTicket = {
        PK : 'USER#user1',
        SK: "TICKET#ticket1",
        amount: 200,
        description: "travel expanses to client location",
        type : "travel",
        status: "Approved"
      };

      ticketDAO.updateTicketStatus.mockResolvedValue(mockUpdatedTicket);
      const result = await ticketService.updateTicketStatus(mockUser, mockTicket, mockStatus);
      expect(result).toEqual(mockUpdatedTicket);
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledTimes(1);
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledWith(mockUser, mockTicket, mockStatus);
    });

     test("updateTicketStatus should return null if DB operation fails", async () => {
      ticketDAO.updateTicketStatus.mockResolvedValue(null);
      const result = await ticketService.updateTicketStatus(mockUser, mockTicket, mockStatus);
      expect(result).toBeNull();
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledTimes(1);
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledWith(mockUser, mockTicket, mockStatus);
    });

     test("updateTicketStatus should return Ticket either does not exist or is already processed if ticket is already processed", async () => {
      ticketDAO.updateTicketStatus.mockResolvedValue("Ticket either does not exist or is already processed");
      const result = await ticketService.updateTicketStatus(mockUser, mockTicket, mockStatus);
      expect(result).toBe("Ticket either does not exist or is already processed");
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledTimes(1);
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledWith(mockUser, mockTicket, mockStatus);
    });

    test("updateTicketStatus should return Ticket either does not exist or is already processed if ticket doesnot exist", async () => {
      ticketDAO.updateTicketStatus.mockResolvedValue("Ticket either does not exist or is already processed");
      const result = await ticketService.updateTicketStatus(mockUser, mockTicket, mockStatus);
      expect(result).toBe("Ticket either does not exist or is already processed");
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledTimes(1);
      expect(ticketDAO.updateTicketStatus).toHaveBeenCalledWith(mockUser, mockTicket, mockStatus);
    });
  });

  });
