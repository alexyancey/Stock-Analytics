import yfinance as yf
import data_types

def load_past_stocks(ticker):
    return yf.download(tickers=ticker, interval="5m", period='5d', prepost=True, repair=True)

def load_current_data(ticker):
    return yf.Ticker(ticker)

def get_data_type():
    return data_types.YfinanceData()