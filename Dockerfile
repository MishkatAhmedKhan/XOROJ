# Use the official gcc image as a base
FROM gcc:13

# Install the 'time' utility
RUN apt-get update && apt-get install -y time && rm -rf /var/lib/apt/lists/*

# Set the default working directory
WORKDIR /work
