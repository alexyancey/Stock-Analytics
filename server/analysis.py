import pandas as pd
import pandas_ta as ta
import numpy as np
import yfinance as yf

def calculate_support_resistance(data, window):
    data['Support'] = data['low'].rolling(window=window).min()
    data['Resistance'] = data['high'].rolling(window=window).max()
    return data['Support'].iloc[-1], data['Resistance'].iloc[-1]

def detect_trend(index, data, order=1):
    result = np.polyfit(index, list(data), order)
    slope = result[-2]
    return float(slope)

def calculate_macd(data):
    data.ta.macd(close='close', fast=12, slow=26, append=True)

def calculate_rsi(data, period=14):
    data['Change'] = data['close'].diff()
    data['Gain'] = data['Change'].clip(lower=0)
    data['Loss'] = data['Change'].clip(upper=0).abs()
    data['Avg_Gain'] = data['Gain'].rolling(window=period).mean()
    data['Avg_Loss'] = data['Loss'].rolling(window=period).mean()
    data['RSI'] = 100 - (100 / (1 + (data['Avg_Gain'] / data['Avg_Loss'])))

def check_brc(data, info):
    result = True
    if info['resistance_past_hour'] <= 100:
        result = False
    return result

def check_rbr(data, info):
    return True

def check_bounce_reject(data, info):
    return True