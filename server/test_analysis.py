import pytest
import pandas as pd
import analysis
import api

data_type = api.get_data_type()
cols = [data_type.open, data_type.high, data_type.low, data_type.close, data_type.volume, '9ema']

def entry(open, close, high, low, volume, ema=0):
    return { 
        data_type.open: open, 
        data_type.high: high, 
        data_type.low: low, 
        data_type.close: close, 
        data_type.volume: volume,
        '9ema': ema
    }

def create_info():
    return {
        'resistance_past_night': 100,
        'resistance_past_day': 110,
        'resistance_past_week': 120,
        'support_past_night': 50,
        'support_past_day': 40,
        'support_past_week': 30
    }

# ------------------------------------------
# BRC
# ------------------------------------------

def test_upward_brc():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=110, close=110, high=110, low=110, volume=500)
    data.loc[len(data)] = entry(open=109, close=111, high=111, low=109, volume=550)
    data.loc[len(data)] = entry(open=111, close=108, high=111, low=108, volume=520)

    result, key_level = analysis.check_brc(data, info)
    assert result == 1
    assert key_level == 110

def test_downward_brc():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=60, close=60, high=60, low=60, volume=500)
    data.loc[len(data)] = entry(open=51, close=49, high=51, low=49, volume=550)
    data.loc[len(data)] = entry(open=49, close=55, high=55, low=49, volume=520)

    result, key_level = analysis.check_brc(data, info)
    assert result == -1
    assert key_level == 50

def test_brc_with_bad_vol():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=60, close=60, high=60, low=60, volume=500)
    data.loc[len(data)] = entry(open=51, close=49, high=51, low=49, volume=400)
    data.loc[len(data)] = entry(open=49, close=55, high=55, low=49, volume=300)

    result, key_level = analysis.check_brc(data, info)
    assert result == 0
    assert key_level == 0

def test_upward_brc_with_bad_open():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=110, close=110, high=110, low=110, volume=500)
    data.loc[len(data)] = entry(open=112, close=111, high=112, low=111, volume=550)
    data.loc[len(data)] = entry(open=111, close=108, high=111, low=108, volume=520)

    result, key_level = analysis.check_brc(data, info)
    assert result == 0
    assert key_level == 0

def test_brc_with_eq_vol():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=60, close=60, high=60, low=60, volume=500)
    data.loc[len(data)] = entry(open=51, close=49, high=51, low=49, volume=500)
    data.loc[len(data)] = entry(open=49, close=55, high=55, low=49, volume=500)

    result, key_level = analysis.check_brc(data, info)
    assert result == 0
    assert key_level == 0

# ------------------------------------------
# Bounce Reject
# ------------------------------------------

def test_upward_bounce():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=600)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=500)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
    data.loc[len(data)] = entry(open=32, close=30.5, high=119.5, low=115, volume=300, ema=40)

    result, key_level = analysis.check_bounce_reject(data, info)
    assert result == 1
    assert key_level == 30

def test_downward_bounce():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=600)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=500)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
    data.loc[len(data)] = entry(open=115, close=119.5, high=119.5, low=115, volume=300, ema=113)

    result, key_level = analysis.check_bounce_reject(data, info)
    assert result == -1
    assert key_level == 120

def test_bounce_without_threshold():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=600)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=500)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
    data.loc[len(data)] = entry(open=32, close=31, high=119.5, low=115, volume=300, ema=40)

    result, key_level = analysis.check_bounce_reject(data, info)
    assert result == 0
    assert key_level == 0

def test_bounce_with_bad_vol():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=100)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=100)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=200)
    data.loc[len(data)] = entry(open=32, close=30.5, high=119.5, low=115, volume=300, ema=40)

    result, key_level = analysis.check_bounce_reject(data, info)
    assert result == 0
    assert key_level == 0

def test_bounce_close_to_ema():
    info = create_info()
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=600)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=500)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
    data.loc[len(data)] = entry(open=32, close=30.5, high=119.5, low=115, volume=300, ema=30)

    result, key_level = analysis.check_bounce_reject(data, info)
    assert result == 0
    assert key_level == 0

# ------------------------------------------
# RBR
# ------------------------------------------

def test_upward_rbr():
    data = pd.DataFrame(columns=cols)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=200)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=300)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
    data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=500, ema=119)
    current = {
        'open': 119,
        'currentPrice': 119.05,
        'volume': 200
    }
    result = analysis.check_rbr(data, current)
    assert result == 1

# def test_upward_rbr_with_vol_downtrend():
#     data = pd.DataFrame(columns=cols)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=500)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=300)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=200, ema=119)
#     current = {
#         'open': 119,
#         'currentPrice': 119.05,
#         'volume': 90
#     }
#     result = analysis.check_rbr(data, current)
#     assert result == -1

# def test_upward_rbr():
#     data = pd.DataFrame(columns=cols)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=200)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=300)
#     data.loc[len(data)] = entry(open=115, close=119, high=119, low=115, volume=400)
#     data.loc[len(data)] = entry(open=115, close=110, high=119, low=115, volume=500, ema=109.1)
#     current = {
#         'open': 110,
#         'currentPrice': 110.05,
#         'volume': 200
#     }
#     result = analysis.check_rbr(data, current)
#     assert result == -1