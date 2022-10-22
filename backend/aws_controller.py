import boto3;

dynamo_client = boto3.client('dynamodb')

def get_user():
    return dynamo_client.scan(TableName='HackGT9UserMetadata')

def get_stocks():
    # return boto3.client('dynamodb').list_tables()
    return dynamo_client.scan(TableName='HackGT9UserStocks')