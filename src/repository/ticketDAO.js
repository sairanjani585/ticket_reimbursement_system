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
            logger.info(`ticketDAO : PUT command complete ${JSON.stringify(params.Item)}`);
            return params.Item;
        }catch(error)
        {
            logger.info(`ticketDAO : PUT command failed ${JSON.stringify(ticket)}`);
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
            logger.info(`ticketDAO : Query command complete ${JSON.stringify(data.Items)}`);
            return data.Items;
        }catch(error){
            logger.info(`ticketDAO : Query command failed ${userName}`);
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
            logger.info(`ticketDAO : Scan command complete ${JSON.stringify(data.Items)}`);
            return data.Items;
        }catch(error){
            logger.info(`ticketDAO : Scan command failed ${status}`);
            logger.error(error);
            return null;
        }
    }
 
    async function updateTicketStatus(userName, ticketId, status)
    {
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
            logger.info(`ticketDAO : Update command complete ${JSON.stringify(data.Attributes)}`);
            return data.Attributes;
        }catch(error)
        {
            logger.info(`ticketDAO : Update command failed ${ticketId} ${status}`);
            logger.error(error);
            if(error.name === 'ConditionalCheckFailedException'){
                return "Ticket either does not exist or is already processed";
            }
            else{
                return null;
            }
        }
    }

    module.exports = {postTicket, getTicketsByUser, getTicketsByStatus, updateTicketStatus};