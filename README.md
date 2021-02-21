# Gemini Reverse Proxy

This is a marginally implemented reverse proxy for the Gemini protocol. It does the job though.

## Current Drawbacks

The proxy must have a certificate that includes all the upstream host names in one certificate. This should be addressable via SNI in the future.

## Quick Start

```sh
# If all upstreams can use a wildcard cert
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=*.myupstream.example'
# If you need alt_names that can't be wildcarded
# TODO: Oneline or example openssl config file
# Install dependencies
yarn
# Copy and edit upstreams file
cp upstreams.json.example upstreams.json
# Start reverse proxy
yarn dev
```

# Acknowledgements

The code is heavily inspired by [jgkaplan/gemini-server](https://github.com/jgkaplan/gemini-server).
