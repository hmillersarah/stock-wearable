from flask import Flask
import yfinance as yf
import json

api = Flask(__name__)

@api.route('/profile')
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@api.route('/stock')
def stock():
    msft = yf.Ticker("MSFT")
    response_body = msft.info

    return response_body

@api.route('/market')
def market():
    msft = yf.Ticker("MSFT")
    response_body = msft.history(period="1mo")
    print(response_body['Close'].max())
    return str(response_body['Close'].max())
    #return response_body.to_json(orient='records')

if __name__ == '__main__':
    api.run(threaded=True, port=5000)