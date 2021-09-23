# chrome-publish-action

Github Action to publish browser extension using the Chrome Web Store API v1.1

> :warning: **Your extension needs to be published to be able to use this action**

## How to get API credentials

See https://developer.chrome.com/docs/webstore/using_webstore_api/

## Inputs

## `chrome-extension-id`

Extension ID

## `chrome-client-id`

Client ID

## `chrome-client-secret`

Client Secret

## `chrome-refresh-token`

Refresh Token

## `zip`

Input file

## Usage

```yaml
uses: thoughtsunificator/chrome-publish-action@master
with:
  zip: build/your-extension.zip
  chrome-extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
  chrome-client-id: ${{ secrets.CHROME_CLIENT_ID }}
  chrome-client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
  chrome-refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
```
