import yfinance as yf
import data_types

def load_past_stocks(ticker):
    try:
        data = yf.download(tickers=ticker, interval="5m", period='5d', prepost=True)
    except Exception as e:
        print("An unexpected error occurred loading past data:", e)
        return None
    else:
        return data 

def load_current_data(ticker):
    try:
        data = yf.Ticker(ticker)
    except Exception as e:
        print("An unexpected error occurred loading current data:", e)
        return None
    else:
        return data

def get_data_type():
    return data_types.YfinanceData()