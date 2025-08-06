# API Service for HiAnime.to Integration

This directory contains the backend service for integrating with HiAnime.to.

## Features

- Web scraping for anime data
- Video source extraction
- Subtitle handling
- Search functionality
- Trending/Popular anime lists
- Episode information

## Usage

The API service is integrated directly into the Electron renderer process.
It uses CORS-enabled requests and handles rate limiting to respect the source website.

## Security

- All requests are made from the client side
- No sensitive data is stored
- Respects robots.txt and rate limits
- Implements proper error handling

## Note

This implementation is for educational purposes. 
Please respect the terms of service of any website you interact with.
