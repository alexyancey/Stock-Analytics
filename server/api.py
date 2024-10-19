import yfinance as yf
import data_types
import pandas as pd
import datetime

def load_past_stocks(ticker, trim=False):
    try:
        data = yf.download(tickers=ticker, interval="5m", period='5d', prepost=True)
        if trim:
            today = pd.to_datetime(datetime.date.today(), format='%Y-%m-%d')
            data['date'] = pd.to_datetime(data.index.date, format='%Y-%m-%d')
            data = data.between_time('09:30:00', '15:55:00')
            data = data[data['date'] == today]

    except Exception as e:
        print("An unexpected error occurred loading past data:", e)
        return None
    else:
        return data

def load_current_data(ticker):
    try:
        data = yf.download(tickers=ticker, interval="1m", period='1d', prepost=True)
        # Get data from past 4 minutes since we check every 4m
        relevant_data = data.iloc[-4:]
        current = {}
        current['open'] = relevant_data.iloc[0][get_data_type().open]
        current['high'] = relevant_data[get_data_type().high].max()
        current['low'] = relevant_data[get_data_type().low].min()
        current['volume'] = relevant_data[get_data_type().volume].sum()
        current['currentPrice'] = relevant_data.iloc[-1][get_data_type().close]

    except Exception as e:
        print("An unexpected error occurred loading current data:", e)
        return None
    else:
        return current

def get_data_type():
    return data_types.YfinanceData()