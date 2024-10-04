import pandas as pd
import pandas_ta as ta
import numpy as np
import yfinance as yf
from flask import Flask, request
import analysis

app = Flask(__name__)

@app.route('/analyze')
def analyze():
    intervals_per_day = 192
    max_days = 5

    # Load recent data
    df = pd.read_csv('data/TSLA_test.csv')
    df = df.iloc[-(intervals_per_day * max_days):]

    # Calculate trends
    index = np.arange(len(df))
    data = df['close'].tolist()
    trend = analysis.detect_trend(index, data)
    trend_summary = 'Neutral'
    if trend > 0:
        trend_summary = 'Upward'
    elif trend < 0:
        trend_summary = 'Downward'

    overnight_len = int(intervals_per_day / 2)
    overnight = df.iloc[-overnight_len:]
    index = np.arange(len(overnight))
    data = overnight['close'].tolist()
    overnight_trend = analysis.detect_trend(index, data)
    overnight_trend_summary = 'Neutral'
    if overnight_trend > 0:
        overnight_trend_summary = 'Upward'
    elif overnight_trend < 0:
        overnight_trend_summary = 'Downward'

    # Calculate MACD
    analysis.calculate_macd(df)
    macd = df['MACD_12_26_9'].iloc[-1]

    # Calculate RSI
    analysis.calculate_rsi(df)
    rsi = df['RSI'].iloc[-1]
    overbought = rsi >= 70
    oversold = rsi <= 30
    rsi_summary = 'Neutral'
    if overbought:
        rsi_summary = 'Overbought, possible downward movement'
    elif oversold:
        rsi_summary = 'Oversold, possible upward movement'

    # Calculate supports/resistances
    support_past_hour, resistance_past_hour = analysis.calculate_support_resistance(df, 12)
    support_past_night, resistance_past_night = analysis.calculate_support_resistance(df, int(intervals_per_day / 2))
    support_past_week, resistance_past_week = analysis.calculate_support_resistance(df, len(df))

    summary = f"""
    Current Price: {df.iloc[-1]['close']}

    MACD: {round(macd, 2)}
    RSI: {round(rsi, 2)}
    {rsi_summary}

    Overnight trend: {overnight_trend_summary}
    Overall trend: {trend_summary}

    Resistances at {round(resistance_past_hour, 2)}, {round(resistance_past_night, 2)}, {round(resistance_past_week, 2)}
    Supports at {round(support_past_hour, 2)}, {round(support_past_night, 2)}, {round(support_past_week, 2)}
    """
    return summary

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)