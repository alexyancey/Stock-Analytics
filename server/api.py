import pandas as pd
import yfinance as yf

def load_past_stocks(ticker, intervals_per_day=192, max_days=5):

    # Load recent data
    df = pd.read_csv('data/TSLA_test.csv')
    df = df.iloc[-(intervals_per_day * max_days):]
    return df

def load_recent_data(ticker):
    return yf.Ticker(ticker).history(interval="5m", period="1d")

def load_current_data(ticker):
    return yf.Ticker(ticker)