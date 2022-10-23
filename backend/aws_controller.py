import boto3

dynamo_client = boto3.client('dynamodb')
dynamo_resource = boto3.resource('dynamodb').Table('HackGT9UserStocks')

def get_user():
    return dynamo_client.scan(TableName='HackGT9UserMetadata')

def get_stocks():
    # return boto3.client('dynamodb').list_tables()
    return dynamo_client.scan(TableName='HackGT9UserStocks')

def add_stock(user, stock, frequency, percentChg, alertInt):
    response = dynamo_resource.put_item(
        Item={
            "userID": user,
            "stockName": stock,
            "frequency": frequency,
            "percentChange": percentChg,
            "alertInterval": alertInt
        }
    )
    return response

def delete_stock(user, stock):
    response = dynamo_resource.delete_item(
        Key={
            "userID": user,
            "stockName": stock
        }
    )
    return response

def update_stock(user, stock, newFreq):
    response = dynamo_resource.update_item(
        Key={
            "userID": user,
            "stockName": stock,
        },
        UpdateExpression="set frequency = :frequency",
        ExpressionAttributeValues = {":frequency": newFreq},
        ReturnValues = "UPDATED_NEW"
    )
    return response

def update_percentChg(user, stock, newPercentChg):
    response = dynamo_resource.update_item(
        Key={
            "userID": user,
            "stockName": stock,
        },
        UpdateExpression="set percentChange = :percentChange",
        ExpressionAttributeValues = {":percentChange": newPercentChg},
        ReturnValues = "UPDATED_NEW"
    )
    return response

def update_alert(user, stock, newAlert):
    response = dynamo_resource.update_item(
        Key={
            "userID": user,
            "stockName": stock,
        },
        UpdateExpression="set alertInterval = :alertInterval",
        ExpressionAttributeValues = {":alertInterval": newAlert},
        ReturnValues = "UPDATED_NEW"
    )
    return response