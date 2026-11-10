# legacy embedding default compatibility

An indexed store from the pre-metadata ai-agent release must resolve the
historical OpenAI default when no embedding configuration is supplied.

```execute
mkdir -p .legacy-context
printf '{"legacy.txt":{"chunks":["chunk-1"]}}' > .legacy-context/ids.json
node legacy-default-check.cjs .legacy-context
```

```expect
{"type":"openai","config":{}}
```

```afterAll
rm -rf .legacy-context
```
