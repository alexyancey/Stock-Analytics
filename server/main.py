import numpy as np
from flask import Flask, request, jsonify
import analysis
import api

app = Flask(__name__)

@app.route('/analyze/<string:ticker>')
def analyze(ticker):
    # Load recent data
    df = api.load_past_stocks(ticker)
    if df is None:
        return jsonify({ "error": "Couldn't load past data"}), 500

    # Calculate trends
    index = np.arange(len(df))
    data = df[api.get_data_type().close].tolist()
    trend = analysis.detect_trend(index, data)
    trend_summary = 'Neutral'
    if trend > 0:
        trend_summary = 'Upward'
    elif trend < 0:
        trend_summary = 'Downward'

    overnight = api.parse_overnight_data(df)
    index = np.arange(len(overnight))
    data = overnight[api.get_data_type().close].tolist()
    overnight_trend = analysis.detect_trend(index, data)
    overnight_trend_summary = 'Neutral'
    if overnight_trend > 0:
        overnight_trend_summary = 'Upward'
    elif overnight_trend < 0:
        overnight_trend_summary = 'Downward'

    prev_day = api.parse_previous_day_data(df)

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
    support_past_night, resistance_past_night = analysis.calculate_support_resistance(overnight, len(overnight))
    support_past_day, resistance_past_day = analysis.calculate_support_resistance(prev_day, len(prev_day))
    support_past_week, resistance_past_week = analysis.calculate_support_resistance(df, len(df))

    result = {
        "current_price": df.iloc[-1][api.get_data_type().close],
        "macd": round(macd, 2),
        "rsi": round(rsi, 2),
        "rsi_summary": rsi_summary,
        "overnight_trend": overnight_trend_summary,
        "overall_trend": trend_summary,
        "resistance_past_night": round(resistance_past_night, 2),
        "support_past_night": round(support_past_night, 2),
        "resistance_past_day": round(resistance_past_day, 2),
        "support_past_day": round(support_past_day, 2),
        "resistance_past_week": round(resistance_past_week, 2),
        "support_past_week": round(support_past_week, 2)
    }
    return jsonify(result)

@app.route('/detect/<string:ticker>', methods=['POST'])
def detect(ticker):
    info = request.json
    data = api.load_past_stocks(ticker=ticker, trim=True)
    if data is None:
        return jsonify({ "error": "Couldn't load past data" }), 500
    elif data.empty:
        return jsonify({ "error": "No market data for detection yet" })
    data['9ema'] = data[api.get_data_type().close].ewm(span=9, adjust=False).mean()

    direction, key_level = analysis.check_brc(data, info)
    brc = {
        "direction": direction,
        "key_level": key_level
    }

    direction, key_level = analysis.check_bounce_reject(data, info)
    bounce_reject = {
        "direction": direction,
        "key_level": key_level
    }

    result = {
        "brc": brc,
        "bounce_reject": bounce_reject
    }
    return jsonify(result)

@app.route('/detect/alt/<string:ticker>')
def detectAlt(ticker):
    data = api.load_past_stocks(ticker=ticker, trim=True)
    if data is None:
        return jsonify({ "error": "Couldn't load past data" }), 500
    elif data.empty:
        return jsonify({ "error": "No market data for detection yet" })
    data['9ema'] = data[api.get_data_type().close].ewm(span=9, adjust=False).mean()
    current = api.load_current_data(ticker)
    if current is None:
        return jsonify({ "error": "Couldn't load current data" }), 500

    
    analysis.calculate_rsi(data)
    rsi = data['RSI'].iloc[-1]

    rbr = analysis.check_rbr(data, current)
    morning_star = analysis.check_morning_star(data, current, rsi)
    hammer = analysis.check_hammer(current, rsi)
    engulfing = analysis.check_engulfing(data, current)
    result = { 
        "rbr": rbr,
        "morning_star": morning_star,
        "hammer": hammer,
        "engulfing": engulfing
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=4050, debug=True, threaded=True)