const express = require('express');
const ticketController = express.Router();
const ticketService = require("../service/ticketService");
const { authenticateToken } = require("../util/jwt");

ticketController.use(authenticateToken);

ticketController.post("/", validatePostTicket, async (req, res) => 
{
    try {
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
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
    
   
});

// Update ticket status (only managers can update status)
ticketController.patch('/:userName/:ticketId', validatePatchTicket, async (req, res) => {
  try {
    const { userName, ticketId } = req.params;
    const { status } = req.body;

    const data = await ticketService.updateTicketStatus(userName, ticketId, status);
    
    if(data === 'Ticket is already processed'){
      res.status(400).json({message: "Ticket is already processed ", data: ticketId});  
    }
    else if(data){
        res.status(200).json({message: "Ticket status updated successfully", data: data});
    }else{
        res.status(400).json({message: "Ticket status update failed", data: ticketId});
    }
    
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get all tickets by status (only accessible by managers)
ticketController.get('/', validateGetTicketByStatus, async (req, res) => {
  try {

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
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});






// Get ticket history (only the owner can see their ticket history)
ticketController.get('/:userName', validateGetTicketByUser, async (req, res) => {
  try {
    
    
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
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

function validatePostTicket(req, res, next){
    const ticket = req.body;
    if (req.user.role !== "employee") {
      res.status(401).json({message : "Finance Managers cannot post tickets", data: ticket});
    }
    else if(ticket.amount && ticket.description){
        if(ticket.amount>0 && ticket.description.length>0){
            next();
        }
        else{
          res.status(400).json({message: "Invalid amount or description", data: ticket});
        }
    }else{
        res.status(400).json({message: "Invalid amount or description", data: ticket});
    }
}

function validatePatchTicket(req, res, next){
    const { userName, ticketId } = req.params;
    const { status } = req.body;
    const validStatuses = ["Approved", "Denied"];

    if (req.user.role !== "manager") {
        res.status(401).json({ message: "Employees cannot change status" });
    }
    else if (!status) {
        res.status(400).json({ message: 'New status is required' });
    }
    else if(!validStatuses.includes(status)){
      res.status(400).json({ message: 'New status can only be Approved or Denied' });
    }
    else if(!ticketId)
    {
      res.status(400).json({ message: 'TicketId is required' });
    }
    else if(!userName){
      res.status(400).json({ message: 'User Name is required' });
    }
    else{
       next();
    }
}

function validateGetTicketByStatus(req, res, next){
  if (req.user.role !== "manager") {
        res.status(401).json({ message: "Employees cannot access tickets by status" });
    }
    else{
      next();
    }
}

function validateGetTicketByUser(req, res, next){
  
  if( req.user.userName && req.params.userName )
  {
    if(req.user.userName === req.params.userName){
      next();
    }
    else{
      res.status(403).json({ message: "Each employee can only access tickets submitted by them" });
    }

  }
  else{
    res.status(403).json({ message: "Forbidden Access" });
  }
     
}





module.exports = ticketController;