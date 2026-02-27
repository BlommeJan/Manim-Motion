FROM manimcommunity/manim:stable

WORKDIR /app

# Ensure Python output is unbuffered for real-time logging
ENV PYTHONUNBUFFERED=1

# Install into image venv as root (base image runs as non-root and cannot write to /opt/venv)
USER root
RUN pip install --no-cache-dir redis==5.0.8 manim-fonts==0.5.0

# Create fonts cache directory (use $HOME since container may not run as root)
RUN mkdir -p $HOME/.cache/manim-fonts

# Copy worker script
COPY worker.py /app/worker.py

CMD ["python", "/app/worker.py"]
