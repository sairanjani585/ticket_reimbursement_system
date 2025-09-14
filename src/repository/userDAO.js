const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient,PutCommand, GetCommand} = require('@aws-sdk/lib-dynamodb');
const {logger} = require("../util/logger");

    const client = new DynamoDBClient({region: "us-east-1"});
    const documentClient = DynamoDBDocumentClient.from(client);

    const TableName = 'TicketReimbursement';

    async function postUser(userName,hashedPassword)
    {
       
        const params = {
            TableName,
            Item : {
                PK : `USER#${userName}`,
                SK : 'PROFILE',
                password : hashedPassword,
                role : 'employee'
            },
            ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
            ExpressionAttributeNames: {'#pk': 'PK','#sk': 'SK',},
        };
        const command = new PutCommand(params);
        try{
            const data = await documentClient.send(command);
            logger.info(`PUT command to databse complete ${JSON.stringify(params.Item)}`);
            return params.Item;
        }catch(error)
        {
            logger.error(error);
            if(error.name === 'ConditionalCheckFailedException'){
                return "User Already Exists";
            }
            else{
                return null;
            }
            
        }

    }

    
    async function getUserByName(userName)
    {
        
        const command = new GetCommand({
            TableName,
            Key : {
                PK : `USER#${userName}`,
                SK : 'PROFILE'
            }
        });
        try{
            const data = await documentClient.send(command);
            logger.info(`Get command to database complete ${JSON.stringify(data.Item)}`);
            return data.Item;
        }catch(error){
            logger.error(error);
            return null;
        }
    }

 
    module.exports = {postUser, getUserByName};