import boto3
from boto3.dynamodb.conditions import Attr

AWS_ACCESS_KEY="AKIAUYMLV4ITPD5PEUFU"
AWS_SECRET_ACCESS_KEY="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"
AWS_REGION="us-east-1"

# dynamodb = boto3.resource('dynamodb', aws_access_key_id=AWS_ACCESS_KEY,
#                             aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
#                             region_name=AWS_REGION)

dynamo_client = boto3.client('dynamodb', aws_access_key_id=AWS_ACCESS_KEY,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                            region_name=AWS_REGION)
dynamo_resource = boto3.resource('dynamodb', aws_access_key_id=AWS_ACCESS_KEY,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                            region_name=AWS_REGION)

def get_user():
    return dynamo_client.scan(TableName='HackGT9UserMetadata')

def get_stonks():
    # return boto3.client('dynamodb').list_tables()
    return dynamo_client.scan(TableName='HackGT9UserStocks')

def get_stocks(userid):
    # return boto3.client('dynamodb').list_tables()
    return dynamo_resource.Table('HackGT9UserStocks').scan(FilterExpression=Attr('userID').eq(userid))

def get_device_id(userid):
    table = dynamo_resource.Table('HackGT9UserMetadata')
    response = table.scan(
        FilterExpression=Attr('userID').eq(userid)
    )
    return response["Items"][0]["deviceID"]

def add_stock(user, stock, frequency, percentChg, checkInt):
    response = dynamo_resource.Table('HackGT9UserStocks').put_item(
        Item={
            "userID": user,
            "stockName": stock,
            "frequency": frequency,
            "percentChangeForAlert": percentChg,
            "checkInterval": checkInt,
            "stockPricePercentChange": 0
        }
    )
    return response

def delete_stock(user, stock):
    response = dynamo_resource.Table('HackGT9UserStocks').delete_item(
        Key={
            "userID": user,
            "stockName": stock
        }
    )
    return response

def update_stock(user, stock, newFreq):
    response = dynamo_resource.Table('HackGT9UserStocks').update_item(
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
    response = dynamo_resource.Table('HackGT9UserStocks').update_item(
        Key={
            "userID": user,
            "stockName": stock,
        },
        UpdateExpression="set percentChangeForAlert = :percentChangeForAlert",
        ExpressionAttributeValues = {":percentChangeForAlert": newPercentChg},
        ReturnValues = "UPDATED_NEW"
    )
    return response

def update_stock_price_percentChg(user, stock, newStockPricePercentChg):
    response = dynamo_resource.Table('HackGT9UserStocks').update_item(
        Key={
            "userID": user,
            "stockName": stock,
        },
        UpdateExpression="set stockPricePercentChange = :stockPricePercentChange",
        ExpressionAttributeValues = {":stockPricePercentChange": newStockPricePercentChg},
        ReturnValues = "UPDATED_NEW"
    )
    return response

def update_alert(user, stock, newAlert):
    response = dynamo_resource.Table('HackGT9UserStocks').update_item(
        Key={
            "userID": user,
            "stockName": stock,
        },
        UpdateExpression="set checkInterval = :checkInterval",
        ExpressionAttributeValues = {":checkInterval": newAlert},
        ReturnValues = "UPDATED_NEW"
    )
    return response