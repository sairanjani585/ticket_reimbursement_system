const ticketDAO = require("../repository/ticketDAO");
const {logger} = require("../util/logger");


//const validTicketStatuses = ["Pending", "Approved", "Denied"];

async function postTicket(ticket) {
    
    const ticketId = crypto.randomUUID();

    const newTicket = {
        ticketId,
        amount: ticket.amount,
        userName : ticket.userName,
        description: ticket.description,
        type : ticket.type || 'general',
    };
    try{
        const result = await ticketDAO.postTicket(newTicket);
        if(result){
            logger.info(`Created new ticket: ${JSON.stringify(result)}`);
        }
        else{
            logger.info(`Ticket could not be created: ${JSON.stringify(newTicket)}`);
        }
        return result;
    }catch(error){
        logger.error(error);
        return null;
    }
    
}

async function updateTicketStatus(userName, ticketId, status) {
    
    try {
        const updatedTicket = await ticketDAO.updateTicketStatus(userName, ticketId, status);
        if(updatedTicket==='Ticket is already processed'){
            logger.info(`Ticket is already processed: ${ticketId}`);
        }
        else if(updatedTicket){
            logger.info(`Updated ticket ${ticketId} status ${status}`);
        }
        else{
            logger.info(`ticket update failed : ${ticketId} status ${status}`);
        }
        return updatedTicket;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

async function getTicketsByStatus(status) {
    try {
        const tickets = await ticketDAO.getTicketsByStatus(status);
        if(tickets){
            logger.info(`${status} tickets retrieved successfully`);
        }else{
            logger.info(`No ${status} tickets found`);
        }
        return tickets;
    } catch (error) {
       logger.error(error);
        return null;
    }
}

async function getTicketsByUser(userName) {
   
    try {
        const tickets = await ticketDAO.getTicketsByUser(userName);
        if(tickets){
            logger.info(`Ticket history retrieved successfully for ${userName}`);
        }else{
            logger.info(`No tickets found for ${userName}`);
        }
        return tickets;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = {
    postTicket,
    getTicketsByUser,
    updateTicketStatus,
    getTicketsByStatus
};