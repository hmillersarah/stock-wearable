from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
import yfinance as yf
import json
import aws_controller

api = Flask(__name__)

api.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
jwt = JWTManager(api)

api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

@api.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@api.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    if email != "test_user" or password != "test":
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=email)
    response = {"access_token":access_token}
    return response

@api.route('/profile')
@jwt_required() 
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@api.route('/stock')
@jwt_required()
def stock():
    msft = yf.Ticker("MSFT")
    response_body = msft.info

    return response_body

@api.route('/market')
#@jwt_required()
def market():
    msft = yf.Ticker("MSFT")
    response_body = msft.history(period="1m")
    # return the first close price (the value 1 month in the past)
    return str(response_body['Close'].iloc[0])
    #print(response_body['Close'].max())
    #return str(response_body['Close'].max())
    #return response_body.to_json(orient='records')

# get current price
@api.route('/stock/<stockName>')
def stockCustom(stockName):
    myStock = yf.Ticker(stockName)
    response_body = str(myStock.info['currentPrice'])
    return response_body

# retrieve past price
@api.route('/market/<stockName>/<freq>')
def marketCustom(stockName, freq):
    myStock = yf.Ticker(stockName)
    response_body = myStock.history(period=freq)
    return str(response_body['Close'].max())

@api.route('/get-stocks')
def get_items():
    return jsonify(aws_controller.get_stocks()["Items"])
    # return jsonify(aws_controller.get_user()["Items"])

@api.route('/get-stocks/<user>')
def get_items_2(user):
    userStocks = []
    allStocks = aws_controller.get_stocks()["Items"]
    for row in allStocks:
        print(row['userID'])
        if (row['userID']['S'] == user):
            userStocks.append([row['stockName']['S'], row['frequency']['S']])
    return userStocks

@api.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

if __name__ == '__main__':
    api.run(threaded=True, port=5000)