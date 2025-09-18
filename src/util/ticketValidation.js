function validatePostTicketMiddleware(req, res, next){
    const ticket = req.body;
    if (req.user.role !== "employee") {
      res.status(403).json({message : "Finance Managers cannot post tickets", data: ticket});
    }
    if(ticket && ticket.amount && ticket.description){
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

function validatePatchTicketMiddleware(req, res, next){
    const validStatuses = ["Approved", "Denied"];
    if (req.user.role !== "manager") {
        res.status(403).json({ message: "Employees cannot change status" });
    }
    else if(!req.body){
      res.status(400).json({ message: 'New status is required' });
    }
    else if (!req.body.status) {
        res.status(400).json({ message: 'New status is required' });
    }
    else if(!validStatuses.includes(req.body.status)){
      res.status(400).json({ message: 'New status can only be Approved or Denied' });
    }
    else{
       next();
    }
}

function validateGetTicketByStatusMiddleware(req, res, next){
  if (req.user.role !== "manager") {
        res.status(403).json({ message: "Employees cannot access tickets by status" });
    }
    else{
      next();
    }
}

function validateGetTicketByUserMiddleware(req, res, next){
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
    res.status(400).json({ message: "Bad Request"});
  }    
}

module.exports = {
    validatePostTicketMiddleware,
    validatePatchTicketMiddleware,
    validateGetTicketByStatusMiddleware,
    validateGetTicketByUserMiddleware,
};