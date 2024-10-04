FROM python:3.11-slim

# Install Dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy your Python code
COPY . .

# Define the command to run the server
CMD ["python", "main.py", "--host", "0.0.0.0"]