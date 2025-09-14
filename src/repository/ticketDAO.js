const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient,PutCommand, QueryCommand, ScanCommand, UpdateCommand,GetCommand} = require('@aws-sdk/lib-dynamodb');
const {logger} = require("../util/logger");

    const client = new DynamoDBClient({region: "us-east-1"});
    const documentClient = DynamoDBDocumentClient.from(client);

    const TableName = 'TicketReimbursement';

    async function postTicket(ticket)
    {
        const params = {
            TableName,
            Item : {
                PK : `USER#${ticket.userName}`,
                SK : `TICKET#${ticket.ticketId}`,
                amount : ticket.amount,
                description : ticket.description,
                type : ticket.type,
                status : 'Pending'
            }
        };
        const command = new PutCommand(params);
        try{
            const data = await documentClient.send(command);
            logger.info(`PUT command to databse complete ${JSON.stringify(params.Item)}`);
            return params.Item;
        }catch(error)
        {
            logger.error(error);
            return null;
        }

    }

    
    async function getTicketsByUser(userName)
    {
        
        const command = new QueryCommand({
            TableName,
            KeyConditionExpression: "PK = :userName AND begins_with(SK, :ticketPrefix)",
            ExpressionAttributeValues: {
                ":userName": `USER#${userName}`,
                ":ticketPrefix": "TICKET#",
            },
        });
        try{
            const data = await documentClient.send(command);
            logger.info(`Query command to database complete ${JSON.stringify(data.Items)}`);
            return data.Items;
        }catch(error){
            logger.error(error);
            return null;
        }
    }

    async function getTicketsById(userName, ticketId)
    {
        
        const params = {
            TableName,
            Key : {
                PK : `USER#${userName}`,
                SK : `TICKET#${ticketId}`,
            }
        };
        const command = new GetCommand(params);
        try{
            const data = await documentClient.send(command);
            logger.info(`Get command to database complete ${JSON.stringify(data.Item)}`);
            return data.Item;
        }catch(error){
            logger.error(error);
            return null;
        }
    }

    async function getTicketsByStatus(status)
    {
        const ticketStatus = `${status}`;
        const command = new ScanCommand({
            TableName,
            FilterExpression: "#status = :status",
            ExpressionAttributeNames: {"#status": "status"},
            ExpressionAttributeValues: {":status":ticketStatus}
        });
        
        try{
            const data = await documentClient.send(command);
            
            logger.info(`Scan command to database complete ${JSON.stringify(data.Items)}`);
            return data.Items;
        }catch(error){
            logger.error(error);
            return null;
        }
    }

   //getTicketsByStatus('Denied'); 

    async function updateTicketStatus(userName, ticketId, status)
    {
       /* const ticket = await getTicketsById(userName,ticketId);
        console.log(ticket);
        if(ticket.status!=='Pending'){
         return "Ticket is already processed";   
        }*/
        const pendingStatus = "Pending";
        const command = new UpdateCommand({
            TableName,
            Key: {
                PK: `USER#${userName}`,
                SK: `TICKET#${ticketId}`
            },
            UpdateExpression: 'SET #status = :status',
            ConditionExpression: '#status = :pendingStatus',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': status,':pendingStatus': pendingStatus },
            ReturnValues: 'ALL_NEW'
            });
        try{
            const data = await documentClient.send(command);
            logger.info(`PUT command to databse complete ${JSON.stringify(data.Attributes)}`);
            return data.Attributes;
        }catch(error)
        {
            logger.error(error);
            if(error.name === 'ConditionalCheckFailedException'){
                return "Ticket is already processed";
            }
            else{
                return null;
            }
        }

    }

   //updateTicketStatus('user1','1077635b-fc1a-4201-9be6-3f2dcd70f596','Denied');

 
    module.exports = {postTicket, getTicketsByUser, getTicketsByStatus, updateTicketStatus};