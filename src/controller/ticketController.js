const express = require('express');
const ticketController = express.Router();
const ticketService = require('../service/ticketService');
const ticketValidation = require('../util/ticketValidation');
const { authenticateToken } = require("../util/jwt");

ticketController.use(authenticateToken);

ticketController.post("/", ticketValidation.validatePostTicketMiddleware, async (req, res) => 
{
    const ticket = req.body;

    if(!ticket.userName){
      ticket.userName = req.user.userName;
    }

    const data = await ticketService.postTicket(ticket);
    if (data) {
        res.status(201).json({message: 'Ticket created successfully',data: data});
    } else {
        res.status(400).json({ message: 'Ticket creation failed', data: ticket});
    }
});


ticketController.patch('/:userName/:ticketId', ticketValidation.validatePatchTicketMiddleware, async (req, res) =>
   {
    const { userName, ticketId } = req.params;
    const { status } = req.body;

    const data = await ticketService.updateTicketStatus(userName, ticketId, status);
    
    if(data === 'Ticket is already processed'){
      res.status(409).json({message: "Ticket either does not exist or is already processed ", data: ticketId});  
    }
    else if(data){
        res.status(200).json({message: "Ticket status updated successfully", data: data});
    }else{
        res.status(400).json({message: "Ticket status update failed", data: ticketId});
    }
});


ticketController.get('/', ticketValidation.validateGetTicketByStatusMiddleware, async (req, res) => {

    const status = `${req.query.status}` || 'Pending';
    
    const tickets = await ticketService.getTicketsByStatus(status);
    if (tickets && tickets.length > 0) {
      return res.status(200).json({
        message: `${status} tickets retrieved successfully`,
        tickets: tickets
      });
    } else {
      return res.status(404).json({ message: "No tickets found" });
    }
 
});


ticketController.get('/:userName', ticketValidation.validateGetTicketByUserMiddleware, async (req, res) => {
    
    const { userName } = req.params;
    const tickets = await ticketService.getTicketsByUser(userName);
    if (tickets && tickets.length > 0) {
      return res.status(200).json({
        message: `Tickets retrieved successfully for ${userName}`,
        data: tickets
      });
    } else {
      return res.status(404).json({ message: 'No tickets found for this user', data: userName });
    }
});

module.exports = ticketController;