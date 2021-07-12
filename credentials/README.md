# Credentials Format

## Algorithmia

File: `algorithmia.json`

```
{
  "apiKey": "YOUR KEY"
}
```

## Watson Natural Language Understanding

File: `watson-nlu.json`

```
{
  "apikey": "YOUR KEY",
  "iam_apikey_description": "YOUR KEY DESCRIPTION",
  "iam_apikey_name": "YOUR KEY NAME",
  "iam_role_crn": "YOUR ROLE CRN",
  "iam_serviceid_crn": "YOUR SERVICEID CRN",
  "url": "YOUR URL"
}
```

## Google Custom Search API

File: `google-search.json`

```
{
  "apiKey": "YOUR KEY",
  "searchEngineId": "YOUR ENGINE ID"
}
```

## Google Youtube Api

File: `google-youtube.json`

```
{
  "web": {
    "client_id": "YOUR CLIENTE ID",
    "project_id": "YOUR PROJECT ID",
    "auth_uri": "YOUR AUTH URI",
    "token_uri": "YOUR TOKEN URI",
    "auth_provider_x509_cert_url": "YOUR AUTH PROVIDER URL",
    "client_secret": "YOUR CLIENT SECRET",
    "redirect_uris": ["YOUR REDIRECT URIS CALLBACK URL"],
    "javascript_origins": ["YOUR LOCAL HOST URL"]
  }
}
```
