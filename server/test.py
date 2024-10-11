import api


# data = api.load_recent_data('TSLA')
# print(data)

# last = data.iloc[-1]['close']
# print(last)

df = api.load_past_stocks('TSLA')
print(df)
df.to_csv("data/results.csv")