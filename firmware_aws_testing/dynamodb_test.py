import boto3  
from boto3.dynamodb.conditions import Key, Attr

AWS_ACCESS_KEY="AKIAUYMLV4ITPD5PEUFU"
AWS_SECRET_ACCESS_KEY="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"
AWS_REGION="us-east-1"

dynamodb = boto3.resource('dynamodb', aws_access_key_id=AWS_ACCESS_KEY,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                            region_name=AWS_REGION)

stock_table = dynamodb.Table("HackGT9UserStocks")
user_table = dynamodb.Table("HackGT9UserMetadata")

userID = "test_user"

user_table.put_item(
    Item={
        "userID": userID,
        "password": "test_password",
        "device": False,
        "deviceID": 123456,
        "numberOfStocks": 0
    }
)

stock_table.put_item(
    Item={
        "userID": userID,
        "stockName": "MSFT",
        "frequency": "10y",
        "percentChangeForAlert": 40,
        "checkInterval": 60,
        "stockPricePercentChange": 0
    }
)

stock_table.put_item(
    Item={
        "userID": userID,
        "stockName": "AMZN",
        "frequency": "3mo",
        "percentChangeForAlert": 30,
        "checkInterval": 100,
        "stockPricePercentChange": 0
    }
)